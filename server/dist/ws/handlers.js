"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHandlers = buildHandlers;
const types_1 = require("./types");
const projects_1 = require("./events/projects");
const assets_1 = require("./events/assets");
const stats_1 = require("./events/stats");
const metrics_1 = require("../logging/metrics");
/**
 * Build the WebSocket handlers bundle.
 *
 * Returns three functions:
 * - onConnection: invoked when a socket connects (welcome message, etc.)
 * - handleMessage: central dispatcher for all `{ event, payload }` frames
 * - setGetConnections: allows the caller to provide a lazy connection counter
 */
function buildHandlers({ log, schemas, models }) {
    /**
     * Called once per new WebSocket connection. Sends a welcome frame.
     */
    async function onConnection(socket, ctx) {
        (0, types_1.send)(socket, 'system:welcome', { version: 'v1' });
    }
    // Function pointer returning the current number of active WS connections.
    // The index bootstrap wires this to a Set.size so we can expose it in stats.
    let getConnections = () => 0;
    /**
     * Allow the server bootstrap to register a connection counter.
     */
    const setGetConnections = (fn) => {
        getConnections = fn;
    };
    // Register modular domain-specific handlers
    const projectHandlers = (0, projects_1.registerProjectEvents)(schemas);
    const assetHandlers = (0, assets_1.registerAssetEvents)(schemas);
    const statsHandlers = (0, stats_1.registerStatsEvents)(schemas, () => getConnections());
    /**
     * Main dispatcher for inbound frames.
     * - Coerces raw Buffer to JSON
     * - Validates payloads per-event with Zod
     * - Delegates to the appropriate module
     * - Emits a structured error frame on failure
     */
    async function handleMessage(socket, raw, ctx) {
        let parsed;
        try {
            // Parse the incoming JSON frame
            parsed = JSON.parse(raw.toString('utf8'));
        }
        catch (err) {
            return (0, types_1.send)(socket, 'system:error', { message: 'invalid json' });
        }
        const start = Date.now();
        let ok = true;
        try {
            switch (parsed.event) {
                case 'system:ping': {
                    // Echo with latency computation based on client-provided ts
                    const req = schemas.SystemPingReq.parse(parsed.payload);
                    const latencyMs = Date.now() - req.ts;
                    return (0, types_1.send)(socket, 'system:ping', { pong: true, ts: req.ts, latencyMs });
                }
                case 'auth:hello': {
                    // Placeholder echo; real identity established at handshake time
                    const req = schemas.AuthHelloReq.parse(parsed.payload);
                    const user = { id: 'anonymous', email: 'anon@example.com', name: null };
                    return (0, types_1.send)(socket, 'auth:hello', { user, issuedAt: new Date().toISOString() });
                }
                // Projects
                case 'projects:list':
                    return projectHandlers.list(socket, parsed.payload);
                case 'projects:get':
                    return projectHandlers.get(socket, parsed.payload);
                case 'projects:create':
                    return projectHandlers.create(socket, parsed.payload, ctx);
                case 'projects:update':
                    return projectHandlers.update(socket, parsed.payload, ctx);
                case 'projects:delete':
                    return projectHandlers.remove(socket, parsed.payload, ctx);
                // Assets
                case 'assets:requestUpload':
                    return assetHandlers.requestUpload(socket, parsed.payload, ctx);
                case 'assets:confirm':
                    return assetHandlers.confirm(socket, parsed.payload, ctx);
                // Stats
                case 'stats:get':
                    return statsHandlers.get(socket);
                case 'stats:subscribe':
                    return statsHandlers.subscribe(socket, parsed.payload);
                default:
                    ok = false;
                    return (0, types_1.send)(socket, 'system:error', { message: `unknown event: ${parsed.event}` });
            }
        }
        catch (err) {
            ok = false;
            // Standardized error envelope; message intentionally terse
            return (0, types_1.send)(socket, 'system:error', { message: err.message || 'unknown error' });
        }
        finally {
            // Record duration + outcome for metrics and log the completion
            const durationMs = Date.now() - start;
            (0, metrics_1.recordEvent)(durationMs, ok);
            log.info({ event: parsed.event, durationMs, ok }, 'event completed');
        }
    }
    return { onConnection, handleMessage, setGetConnections };
}
//# sourceMappingURL=handlers.js.map