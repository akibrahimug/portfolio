"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStatsEvents = registerStatsEvents;
const types_1 = require("../types");
const metrics_1 = require("../../logging/metrics");
/**
 * Create stats handlers bound to a function that reports current WS connection count.
 * @param schemas Zod schemas bundle (unused here but kept for symmetry and future validation)
 * @param getConnections Function that returns current active WS connections
 */
function registerStatsEvents(schemas, getConnections) {
    return {
        /**
         * Handle `stats:get` → return a one-off snapshot of metrics.
         */
        async get(socket) {
            const snap = (0, metrics_1.snapshot)(getConnections());
            return (0, types_1.send)(socket, 'stats:get', snap);
        },
        /**
         * Handle `stats:subscribe` → push a snapshot at provided interval (default 5s).
         * Cleans up the interval when the client disconnects.
         */
        async subscribe(socket, payload) {
            const req = schemas.StatsSubscribeReq.parse(payload ?? { version: 'v1' });
            const period = req.intervalMs ?? 5000;
            let timer = null;
            const tick = () => (0, types_1.send)(socket, 'stats:subscribe', (0, metrics_1.snapshot)(getConnections()));
            timer = setInterval(tick, period);
            socket.once('close', () => timer && clearInterval(timer));
            // push immediately so clients get an instant read
            return tick();
        },
    };
}
//# sourceMappingURL=stats.js.map