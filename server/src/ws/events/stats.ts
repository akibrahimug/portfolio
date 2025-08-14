/**
 * Stats event handlers.
 * - get: returns a single snapshot of current metrics
 * - subscribe: pushes a snapshot every 5 seconds until the socket closes
 *
 * The metrics are computed in-memory by `logging/metrics` and are intended
 * for lightweight visibility. For production-grade telemetry, prefer
 * OpenTelemetry and GCP Cloud Monitoring.
 */
import type { WebSocket } from 'ws';
import type { Schemas } from '../../schemas';
import { send } from '../types';
import { snapshot } from '../../logging/metrics';

/**
 * Create stats handlers bound to a function that reports current WS connection count.
 * @param schemas Zod schemas bundle (unused here but kept for symmetry and future validation)
 * @param getConnections Function that returns current active WS connections
 */
export function registerStatsEvents(schemas: Schemas, getConnections: () => number) {
  return {
    /**
     * Handle `stats:get` → return a one-off snapshot of metrics.
     */
    async get(socket: WebSocket) {
      const snap = snapshot(getConnections());
      return send(socket, 'stats:get', snap);
    },
    /**
     * Handle `stats:subscribe` → push a snapshot at provided interval (default 5s).
     * Cleans up the interval when the client disconnects.
     */
    async subscribe(socket: WebSocket, payload: unknown) {
      const req = schemas.StatsSubscribeReq.parse(payload ?? { version: 'v1' });
      const period = req.intervalMs ?? 5000;
      let timer: NodeJS.Timeout | null = null;
      const tick = () => send(socket, 'stats:subscribe', snapshot(getConnections()));
      timer = setInterval(tick, period);
      socket.once('close', () => timer && clearInterval(timer));
      // push immediately so clients get an instant read
      return tick();
    },
  } as const;
}
