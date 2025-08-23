/**
 * WebSocket event router.
 * - Parses JSON envelopes { event, payload }
 * - Validates payloads with Zod and dispatches to modular handlers
 * - Records per-event metrics and logs duration
 */
import type bunyan from 'bunyan';
import { getTaggedLogger } from '../logging/console';
import type { WebSocket } from 'ws';
import { send } from './types';
import type { Schemas } from '../schemas';
import type { RequestContext } from '../lib/context';
import { registerStatsEvents } from './events/stats';
import { recordEvent } from '../logging/metrics';

/**
 * Dependencies required to construct the handlers router.
 * - log: application logger
 * - schemas: Zod validators for all events
 */
interface Deps {
  log: bunyan;
  schemas: Schemas;
}

/**
 * Build the WebSocket handlers bundle.
 *
 * Returns three functions:
 * - onConnection: invoked when a socket connects (welcome message, etc.)
 * - handleMessage: central dispatcher for all `{ event, payload }` frames
 * - setGetConnections: allows the caller to provide a lazy connection counter
 */
export function buildHandlers({ log, schemas }: Deps) {
  // ensure logs have WS tag when created from index, which already uses SERVER tag
  const wsLog = getTaggedLogger('WS');
  /**
   * Called once per new WebSocket connection. Sends a welcome frame.
   */
  async function onConnection(socket: WebSocket, _ctx: RequestContext) {
    send(socket, 'system:welcome', { version: 'v1' });
    wsLog.info({ event: 'system:welcome' }, 'welcome sent');
  }

  // Function pointer returning the current number of active WS connections.
  // The index bootstrap wires this to a Set.size so we can expose it in stats.
  let getConnections: () => number = () => 0;
  /**
   * Allow the server bootstrap to register a connection counter.
   */
  const setGetConnections = (fn: () => number) => {
    getConnections = fn;
  };

  // Register only stats handlers for WS. CRUD now via HTTPS.
  const statsHandlers = registerStatsEvents(schemas, () => getConnections());

  /**
   * Main dispatcher for inbound frames.
   * - Coerces raw Buffer to JSON
   * - Validates payloads per-event with Zod
   * - Delegates to the appropriate module
   * - Emits a structured error frame on failure
   */
  async function handleMessage(socket: WebSocket, raw: Buffer, ctx: RequestContext) {
    let parsed: { event: string; payload: unknown };
    try {
      // Parse the incoming JSON frame
      parsed = JSON.parse(raw.toString('utf8'));
    } catch (err) {
      return send(socket, 'system:error', { message: 'invalid json' });
    }

    const start = Date.now();
    let ok = true;

    try {
      switch (parsed.event) {
        case 'system:ping': {
          // Echo with latency computation based on client-provided ts
          const req = schemas.SystemPingReq.parse(parsed.payload);
          const latencyMs = Date.now() - req.ts;
          wsLog.info({ event: 'system:ping', latencyMs }, 'ping');
          return send(socket, 'system:ping', { pong: true, ts: req.ts, latencyMs });
        }

        // Projects/Assets over WS are deprecated
        case 'projects:list':
        case 'projects:get':
        case 'projects:create':
        case 'projects:update':
        case 'projects:delete':
        case 'assets:requestUpload':
        case 'assets:confirm':
          return send(socket, 'system:error', {
            message: 'deprecated_event_use_http',
            docs: `${process.env.API_BASE || '/api/v1'}`,
          });
        // Stats
        case 'stats:get':
          wsLog.info({ event: 'stats:get' }, 'dispatch');
          return statsHandlers.get(socket);
        case 'stats:subscribe':
          wsLog.info({ event: 'stats:subscribe' }, 'dispatch');
          return statsHandlers.subscribe(socket, parsed.payload);
        default:
          ok = false;
          return send(socket, 'system:error', { message: `unknown event: ${parsed.event}` });
      }
    } catch (err) {
      ok = false;
      // Standardized error envelope; message intentionally terse
      const message = err instanceof Error ? err.message : 'unknown error';
      return send(socket, 'system:error', { message });
    } finally {
      // Record duration + outcome for metrics and log the completion
      const durationMs = Date.now() - start;
      recordEvent(durationMs, ok);
      const userId = ctx.req.userId;
      log.info(
        { event: parsed.event, durationMs, ok, userId, requestId: ctx.requestId },
        'event completed',
      );
    }
  }

  return { onConnection, handleMessage, setGetConnections };
}
