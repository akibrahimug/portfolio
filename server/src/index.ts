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
import { getTaggedLogger } from './logging/console';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import pkg from '../package.json';

import config from './config';
import { buildSchemas } from './schemas';
import { buildHandlers } from './ws/handlers';
import { connectMongoose } from './infra/mongoose';
import { buildContext } from './lib/context';
import type { AuthenticatedRequest } from './lib/context';
import routes from './routes';
import { verifyTokenOrThrow } from './services/jwt';
import { snapshot } from './logging/metrics';
// import { startMetrics } from './logging/otel'; // Temporarily disabled due to Node version constraint
import { initSentry } from './logging/sentry';


const log = getTaggedLogger('SERVER');

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
  // Parse JSON bodies for HTTP API endpoints
  app.use(express.json());

  // Mount API routes
  app.use(`${config.apiBase}/v1`, routes);

  // Track active WS connections for readiness metrics and stats events
  const connections = new Set<WebSocket>();

  // Minimal HTTP surface under base path
  app.get(`${config.apiBase}/healthz`, (req, res) => {
    // Return metadata helpful for debugging and uptime dashboards
    const now = new Date();
    const mem = process.memoryUsage();
    const payload = {
      ok: true,
      service: config.serviceName,
      version: pkg.version,
      nodeEnv: config.nodeEnv,
      now: now.toISOString(),
      uptimeSec: Math.floor(process.uptime()),
      apiBase: config.apiBase,
      rssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    } as const;
    log.info({ route: 'healthz', ip: req.ip }, 'healthz');
    res.status(200).json(payload);
  });

  app.get(`${config.apiBase}/readyz`, (req, res) => {
    // Consider ready when Mongoose is connected and the process is responsive
    const dbReady = mongoose.connection.readyState === 1; // connected
    const mem = process.memoryUsage();
    const payload = {
      ready: dbReady,
      connections: connections.size,
      apiBase: config.apiBase,
      rssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
    } as const;
    log.info(
      { route: 'readyz', ip: req.ip, ready: dbReady, connections: connections.size },
      'readyz',
    );
    res.status(dbReady ? 200 : 503).json(payload);
  });

  // Optional minimal HTTP stats endpoint mirroring stats:get
  app.get(`${config.apiBase}/stats`, (req, res) => {
    const snap = snapshot(connections.size);
    log.info({ route: 'stats', ip: req.ip, ...snap }, 'stats snapshot');
    res.status(200).json(snap);
  });

  // REST API: projects and assets. Use auth middleware for mutating routes.


  // Create HTTP server to host both HTTP routes and WS upgrades
  const server = http.createServer(app);

  // Infra
  // Establish a Mongo connection (retries handled by driver). Blocks readiness until connected.
  await connectMongoose(config.mongodbUri || '');

  // Ensure DB indexes are created for performance/uniqueness
  await new (await import('./repos/mongo/projectsRepo')).MongoProjectsRepo().ensureIndexes();
  await new (await import('./repos/mongo/assetsRepo')).MongoAssetsRepo().ensureIndexes();

  // Start optional OTEL metrics if configured
  // startMetrics(); // Temporarily disabled due to Node version constraint

  // Build Zod schemas bundle used by handlers to validate all incoming payloads
  const schemas = buildSchemas();

  // WebSocket server mounted under base path; keep only for live stats/health
  const wss = new WebSocketServer({ server, path: `${config.apiBase}/ws` });
  // Construct handlers and inject dependencies. Provide a callback to expose connection counts.
  const { handleMessage, onConnection, setGetConnections } = buildHandlers({
    log,
    schemas,
  });
  setGetConnections(() => connections.size);

  // WS connection lifecycle: create context and delegate message handling
  // Auth is optional for stats-only WebSocket usage
  wss.on('connection', async (socket, req) => {
    // Optional auth: try to extract and verify token but don't require it
    try {
      const token = extractTokenFromReq(req);
      if (token) {
        const claims = await verifyTokenOrThrow(token);
        (req as unknown as { userId?: string }).userId = claims.sub;
        log.info(
          { event: 'ws:connection', userId: claims.sub, ip: req.socket.remoteAddress },
          'ws connected (authenticated)',
        );
      } else {
        log.info(
          { event: 'ws:connection', ip: req.socket.remoteAddress },
          'ws connected (anonymous)',
        );
      }
    } catch (err) {
      // Log auth failure but still allow connection for stats
      log.warn(
        { event: 'ws:connection', error: err instanceof Error ? err.message : String(err) },
        'ws auth failed, continuing as anonymous',
      );
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
    socket.on('close', (code, reason) => {
      connections.delete(socket);
      log.info(
        { event: 'ws:close', code, reason: reason?.toString(), connections: connections.size },
        'ws closed',
      );
    });
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
