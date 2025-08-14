"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bunyan_1 = __importDefault(require("bunyan"));
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const mongoose_1 = __importDefault(require("mongoose"));
const package_json_1 = __importDefault(require("../package.json"));
const config_1 = __importDefault(require("./config"));
const schemas_1 = require("./schemas");
const handlers_1 = require("./ws/handlers");
const mongoose_2 = require("./infra/mongoose");
const Project_1 = require("./models/Project");
const Asset_1 = require("./models/Asset");
const context_1 = require("./lib/context");
const jwt_1 = require("./services/jwt");
const metrics_1 = require("./logging/metrics");
const otel_1 = require("./logging/otel");
const projectsRepo_1 = require("./repos/mongo/projectsRepo");
const assetsRepo_1 = require("./repos/mongo/assetsRepo");
const log = bunyan_1.default.createLogger({ name: config_1.default.serviceName, level: 'info' });
/**
 * Extract a bearer token from the WS upgrade request.
 *
 * Priority:
 * 1) Sec-WebSocket-Protocol subprotocol header (format: "bearer,<token>")
 * 2) Query parameter `token`
 */
function extractTokenFromReq(req) {
    // Prefer subprotocol: bearer,<token>
    const protocols = req.headers['sec-websocket-protocol']?.split(',');
    const maybe = protocols?.map((s) => s.trim()).find((p) => p && p !== 'bearer');
    if (maybe)
        return maybe;
    // Fallback: query param token
    const url = new URL(req.url || '', 'http://localhost');
    const qp = url.searchParams.get('token') || undefined;
    return qp;
}
/**
 * Bootstrap the HTTP server and WS server, connect Mongoose, and start listening.
 */
async function main() {
    const app = (0, express_1.default)();
    app.disable('x-powered-by');
    // CORS allows the configured origins to call the health endpoints and upgrade WS
    app.use((0, cors_1.default)({
        // `wsOrigins` is a CSV parsed to array in config; default is '*'
        origin: config_1.default.wsOrigins || '*',
    }));
    // Parse JSON bodies (not heavily used since API is WS-first)
    app.use(express_1.default.json());
    // Track active WS connections for readiness metrics and stats events
    const connections = new Set();
    // Minimal HTTP surface under base path
    app.get(`${config_1.default.apiBase}/healthz`, (_req, res) => {
        // Return metadata helpful for debugging and uptime dashboards
        const now = new Date();
        const mem = process.memoryUsage();
        res.status(200).json({
            ok: true,
            service: config_1.default.serviceName,
            version: package_json_1.default.version,
            nodeEnv: config_1.default.nodeEnv,
            now: now.toISOString(),
            uptimeSec: Math.floor(process.uptime()),
            apiBase: config_1.default.apiBase,
            wsPath: `${config_1.default.apiBase}/ws`,
            rssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
        });
    });
    app.get(`${config_1.default.apiBase}/readyz`, (_req, res) => {
        // Consider ready when Mongoose is connected and the process is responsive
        const dbReady = mongoose_1.default.connection.readyState === 1; // connected
        const mem = process.memoryUsage();
        res.status(dbReady ? 200 : 503).json({
            ready: dbReady,
            connections: connections.size,
            apiBase: config_1.default.apiBase,
            wsPath: `${config_1.default.apiBase}/ws`,
            rssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
        });
    });
    // Optional minimal HTTP stats endpoint mirroring stats:get
    app.get(`${config_1.default.apiBase}/stats`, (_req, res) => {
        res.status(200).json((0, metrics_1.snapshot)(connections.size));
    });
    // Create HTTP server to host both HTTP routes and WS upgrades
    const server = http_1.default.createServer(app);
    // Infra
    // Establish a Mongo connection (retries handled by driver). Blocks readiness until connected.
    await (0, mongoose_2.connectMongoose)(config_1.default.mongodbUri || '');
    // Ensure DB indexes are created for performance/uniqueness
    await new projectsRepo_1.MongoProjectsRepo().ensureIndexes();
    await new assetsRepo_1.MongoAssetsRepo().ensureIndexes();
    // Start optional OTEL metrics if configured
    (0, otel_1.startMetrics)();
    // Build Zod schemas bundle used by handlers to validate all incoming payloads
    const schemas = (0, schemas_1.buildSchemas)();
    // WebSocket server mounted under base path to keep a single external port/path
    const wss = new ws_1.WebSocketServer({ server, path: `${config_1.default.apiBase}/ws` });
    // Construct handlers and inject dependencies. Provide a callback to expose connection counts.
    const { handleMessage, onConnection, setGetConnections } = (0, handlers_1.buildHandlers)({
        log,
        schemas,
        models: { Project: Project_1.Project, Asset: Asset_1.Asset },
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
            const claims = await (0, jwt_1.verifyTokenOrThrow)(token);
            req.userId = claims.sub;
        }
        catch (err) {
            // Close with 4403 (similar to HTTP 403) on verification failure
            socket.close(4403, 'forbidden');
            return;
        }
        connections.add(socket);
        const requestId = (0, uuid_1.v4)();
        // Build a lightweight context that carries requestId, logger, req, userId
        const ctx = (0, context_1.buildContext)({ requestId, log, req });
        onConnection(socket, ctx).catch((err) => ctx.log.error({ err, requestId }, 'onConnection error'));
        // Route every inbound frame through the central dispatcher
        socket.on('message', (raw) => handleMessage(socket, raw, ctx));
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
    server.listen(config_1.default.port, () => {
        log.info({ port: config_1.default.port, base: config_1.default.apiBase }, 'Server listening');
    });
}
main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map