/**
 * Application entrypoint.
 *
 * Responsibilities:
 * - Initialize Express with a minimal HTTP surface under `config.apiBase`
 *   - GET /healthz → liveness probe with service metadata and memory
 *   - GET /readyz → readiness probe with DB status and active WS connections
 * - Establish a WebSocketServer mounted at `${config.apiBase}/ws`
 *   - Verify Clerk-issued JWTs using JOSE/JWKS during the WS handshake
 *   - Attach `userId` on the underlying HTTP request to be used by event handlers
 * - Wire Zod-validated event handlers and record basic in-memory metrics
 * - Manage connections set for readiness and stats
 * - Handle graceful shutdown on SIGTERM (Cloud Run lifecycle)
 */
import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import bunyan from 'bunyan';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import pkg from '../package.json';

import config from './config';
import { buildSchemas } from './schemas';
import { buildHandlers } from './ws/handlers';
import { connectMongoose } from './infra/mongoose';
import { Project } from './models/Project';
import { Asset } from './models/Asset';
import { buildContext } from './lib/context';
import type { AuthenticatedRequest } from './lib/context';
import { verifyTokenOrThrow } from './services/jwt';
import { snapshot } from './logging/metrics';
import { startMetrics } from './logging/otel';
import { initSentry } from './logging/sentry';

const log = bunyan.createLogger({ name: config.serviceName, level: 'info' });

/**
 * Extract a bearer token from the WS upgrade request.
 *
 * Priority:
 * 1) Sec-WebSocket-Protocol subprotocol header (format: "bearer,<token>")
 * 2) Query parameter `token`
 */
function extractTokenFromReq(req: http.IncomingMessage): string | undefined {
  // Prefer subprotocol: bearer,<token>
  const protocols = (req.headers['sec-websocket-protocol'] as string | undefined)?.split(',');
  const maybe = protocols?.map((s) => s.trim()).find((p) => p && p !== 'bearer');
  if (maybe) return maybe;
  // Fallback: query param token
  const url = new URL(req.url || '', 'http://localhost');
  const qp = url.searchParams.get('token') || undefined;
  return qp;
}

/**
 * Bootstrap the HTTP server and WS server, connect Mongoose, and start listening.
 */
async function main() {
  // Optional Sentry
  initSentry();

  const app = express();
  app.disable('x-powered-by');
  // CORS allows the configured origins to call the health endpoints and upgrade WS
  app.use(
    cors({
      // `wsOrigins` is a CSV parsed to array in config; default is '*'
      origin: config.wsOrigins || '*',
    }),
  );
  // Parse JSON bodies (not heavily used since API is WS-first)
  app.use(express.json());

  // Track active WS connections for readiness metrics and stats events
  const connections = new Set<WebSocket>();

  // Minimal HTTP surface under base path
  app.get(`${config.apiBase}/healthz`, (_req, res) => {
    // Return metadata helpful for debugging and uptime dashboards
    const now = new Date();
    const mem = process.memoryUsage();
    res.status(200).json({
      ok: true,
      service: config.serviceName,
      version: pkg.version,
      nodeEnv: config.nodeEnv,
      now: now.toISOString(),
      uptimeSec: Math.floor(process.uptime()),
      apiBase: config.apiBase,
      wsPath: `${config.apiBase}/ws`,
      rssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
    });
  });

  app.get(`${config.apiBase}/readyz`, (_req, res) => {
    // Consider ready when Mongoose is connected and the process is responsive
    const dbReady = mongoose.connection.readyState === 1; // connected
    const mem = process.memoryUsage();
    res.status(dbReady ? 200 : 503).json({
      ready: dbReady,
      connections: connections.size,
      apiBase: config.apiBase,
      wsPath: `${config.apiBase}/ws`,
      rssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
    });
  });

  // Optional minimal HTTP stats endpoint mirroring stats:get
  app.get(`${config.apiBase}/stats`, (_req, res) => {
    res.status(200).json(snapshot(connections.size));
  });

  // Create HTTP server to host both HTTP routes and WS upgrades
  const server = http.createServer(app);

  // Infra
  // Establish a Mongo connection (retries handled by driver). Blocks readiness until connected.
  await connectMongoose(config.mongodbUri || '');

  // Ensure DB indexes are created for performance/uniqueness
  await new (await import('./repos/mongo/projectsRepo')).MongoProjectsRepo().ensureIndexes();
  await new (await import('./repos/mongo/assetsRepo')).MongoAssetsRepo().ensureIndexes();

  // Start optional OTEL metrics if configured
  startMetrics();

  // Build Zod schemas bundle used by handlers to validate all incoming payloads
  const schemas = buildSchemas();

  // WebSocket server mounted under base path to keep a single external port/path
  const wss = new WebSocketServer({ server, path: `${config.apiBase}/ws` });
  // Construct handlers and inject dependencies. Provide a callback to expose connection counts.
  const { handleMessage, onConnection, setGetConnections } = buildHandlers({
    log,
    schemas,
    models: { Project, Asset },
  });
  setGetConnections(() => connections.size);

  // WS connection lifecycle: authenticate, create context, and delegate message handling
  wss.on('connection', async (socket, req) => {
    // Auth: verify Clerk-issued JWT via JWKS
    try {
      const token = extractTokenFromReq(req);
      if (!token) {
        // Close with 4401 (similar to HTTP 401) if no token present
        socket.close(4401, 'unauthorized');
        return;
      }
      // Verify signature/claims; attach identity to the request for handlers
      const claims = await verifyTokenOrThrow(token);
      (req as unknown as { userId?: string }).userId = claims.sub;
    } catch (err) {
      // Close with 4403 (similar to HTTP 403) on verification failure
      socket.close(4403, 'forbidden');
      return;
    }

    connections.add(socket);
    const requestId = uuidv4();
    // Build a lightweight context that carries requestId, logger, req, userId
    const ctx = buildContext({ requestId, log, req: req as AuthenticatedRequest });
    onConnection(socket, ctx).catch((err) =>
      ctx.log.error({ err, requestId }, 'onConnection error'),
    );

    // Route every inbound frame through the central dispatcher
    socket.on('message', (raw) => handleMessage(socket, raw as Buffer, ctx));
    // Remove from connection set on disconnect to keep metrics accurate
    socket.on('close', () => connections.delete(socket));
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    log.info('SIGTERM received, shutting down');
    // Politely close all sockets so clients can reconnect
    wss.clients.forEach((s) => s.close(1001, 'shutting down'));
    server.close(() => {
      // Exit after the HTTP server has stopped accepting new connections
      process.exit(0);
    });
  });

  // Start listening. Cloud Run will send traffic to this port.
  server.listen(config.port, () => {
    log.info({ port: config.port, base: config.apiBase }, 'Server listening');
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
