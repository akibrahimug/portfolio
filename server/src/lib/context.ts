/**
 * Lightweight per-request context passed into WebSocket event handlers.
 *
 * Purpose:
 * - Carry a stable requestId for correlation in logs/metrics
 * - Provide a logger instance namespaced to the service
 * - Expose the underlying HTTP upgrade request (for userId and headers)
 * - Optionally include userId attached during WS handshake JWT verification
 *
 * Notes:
 * - `userId` is set in `src/index.ts` after successful JWT verification
 * - Handlers can read `(ctx.req as any).userId` or `ctx.userId` if provided
 */
import bunyan from 'bunyan';
import type { IncomingMessage } from 'http';

/**
 * Incoming upgrade request augmented with an optional userId set at WS handshake.
 */
export interface AuthenticatedRequest extends IncomingMessage {
  userId?: string;
}

export interface RequestContext {
  /** Correlation id for this request/event */
  requestId: string;
  /** Logger bound to the service; prefer structured logs */
  log: bunyan;
  /** Underlying HTTP upgrade request (source of userId, headers, ip) */
  req: AuthenticatedRequest;
  /** Optional user identity; generally set during WS handshake */
  userId?: string;
}

/**
 * Build a new context instance. Keep this minimal and immutable.
 */
export function buildContext({ requestId, log, req, userId }: RequestContext): RequestContext {
  const child = log.child({ requestId });
  return { requestId, log: child, req, userId };
}
