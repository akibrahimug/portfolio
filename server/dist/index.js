"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const console_1 = require("./logging/console");
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const mongoose_1 = __importDefault(require("mongoose"));
const package_json_1 = __importDefault(require("../package.json"));
const config_1 = __importDefault(require("./config"));
const schemas_1 = require("./schemas");
const handlers_1 = require("./ws/handlers");
const mongoose_2 = require("./infra/mongoose");
const context_1 = require("./lib/context");
const routes_1 = __importDefault(require("./routes"));
const jwt_1 = require("./services/jwt");
const metrics_1 = require("./logging/metrics");
// import { startMetrics } from './logging/otel'; // Temporarily disabled due to Node version constraint
const sentry_1 = require("./logging/sentry");
const log = (0, console_1.getTaggedLogger)('SERVER');
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
    // Optional Sentry
    (0, sentry_1.initSentry)();
    const app = (0, express_1.default)();
    app.disable('x-powered-by');
    // CORS allows the configured origins to call the health endpoints and upgrade WS
    app.use((0, cors_1.default)({
        // `wsOrigins` is a CSV parsed to array in config; default is '*'
        origin: config_1.default.wsOrigins || '*',
    }));
    // Parse JSON bodies for HTTP API endpoints
    app.use(express_1.default.json());
    // Mount API routes
    app.use(config_1.default.apiBase, routes_1.default);
    // Track active WS connections for readiness metrics and stats events
    const connections = new Set();
    // Minimal HTTP surface under base path
    app.get(`${config_1.default.apiBase}/healthz`, (req, res) => {
        // Return metadata helpful for debugging and uptime dashboards
        const now = new Date();
        const mem = process.memoryUsage();
        const payload = {
            ok: true,
            service: config_1.default.serviceName,
            version: package_json_1.default.version,
            nodeEnv: config_1.default.nodeEnv,
            now: now.toISOString(),
            uptimeSec: Math.floor(process.uptime()),
            apiBase: config_1.default.apiBase,
            rssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        };
        log.info({ route: 'healthz', ip: req.ip }, 'healthz');
        res.status(200).json(payload);
    });
    app.get(`${config_1.default.apiBase}/readyz`, (req, res) => {
        // Consider ready when Mongoose is connected and the process is responsive
        const dbReady = mongoose_1.default.connection.readyState === 1; // connected
        const mem = process.memoryUsage();
        const payload = {
            ready: dbReady,
            connections: connections.size,
            apiBase: config_1.default.apiBase,
            rssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
        };
        log.info({ route: 'readyz', ip: req.ip, ready: dbReady, connections: connections.size }, 'readyz');
        res.status(dbReady ? 200 : 503).json(payload);
    });
    // Optional minimal HTTP stats endpoint mirroring stats:get
    app.get(`${config_1.default.apiBase}/stats`, (req, res) => {
        const snap = (0, metrics_1.snapshot)(connections.size);
        log.info({ route: 'stats', ip: req.ip, ...snap }, 'stats snapshot');
        res.status(200).json(snap);
    });
    // REST API: projects and assets. Use auth middleware for mutating routes.
    // Create HTTP server to host both HTTP routes and WS upgrades
    const server = http_1.default.createServer(app);
    // Infra
    // Establish a Mongo connection (retries handled by driver). Blocks readiness until connected.
    await (0, mongoose_2.connectMongoose)(config_1.default.mongodbUri || '');
    // Ensure DB indexes are created for performance/uniqueness
    await new (await Promise.resolve().then(() => __importStar(require('./repos/mongo/projectsRepo')))).MongoProjectsRepo().ensureIndexes();
    await new (await Promise.resolve().then(() => __importStar(require('./repos/mongo/assetsRepo')))).MongoAssetsRepo().ensureIndexes();
    // Start optional OTEL metrics if configured
    // startMetrics(); // Temporarily disabled due to Node version constraint
    // Build Zod schemas bundle used by handlers to validate all incoming payloads
    const schemas = (0, schemas_1.buildSchemas)();
    // WebSocket server mounted under base path; keep only for live stats/health
    const wss = new ws_1.WebSocketServer({ server, path: `${config_1.default.apiBase}/ws` });
    // Construct handlers and inject dependencies. Provide a callback to expose connection counts.
    const { handleMessage, onConnection, setGetConnections } = (0, handlers_1.buildHandlers)({
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
                const claims = await (0, jwt_1.verifyTokenOrThrow)(token);
                req.userId = claims.sub;
                log.info({ event: 'ws:connection', userId: claims.sub, ip: req.socket.remoteAddress }, 'ws connected (authenticated)');
            }
            else {
                log.info({ event: 'ws:connection', ip: req.socket.remoteAddress }, 'ws connected (anonymous)');
            }
        }
        catch (err) {
            // Log auth failure but still allow connection for stats
            log.warn({ event: 'ws:connection', error: err instanceof Error ? err.message : String(err) }, 'ws auth failed, continuing as anonymous');
        }
        connections.add(socket);
        const requestId = (0, uuid_1.v4)();
        // Build a lightweight context that carries requestId, logger, req, userId
        const ctx = (0, context_1.buildContext)({ requestId, log, req: req });
        onConnection(socket, ctx).catch((err) => ctx.log.error({ err, requestId }, 'onConnection error'));
        // Route every inbound frame through the central dispatcher
        socket.on('message', (raw) => handleMessage(socket, raw, ctx));
        // Remove from connection set on disconnect to keep metrics accurate
        socket.on('close', (code, reason) => {
            connections.delete(socket);
            log.info({ event: 'ws:close', code, reason: reason?.toString(), connections: connections.size }, 'ws closed');
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