/**
 * Authorization helper utilities for WebSocket handlers.
 *
 * `requireAuth` enforces that a user identity was attached during the
 * WebSocket handshake and returns the authenticated `userId`.
 */
import type { RequestContext } from '../lib/context';

/**
 * Ensure the socket is authenticated.
 * @throws Error('unauthorized') when no userId is present
 * @returns userId string
 */
export function requireAuth(ctx: RequestContext): string {
  // The userId is attached to the upgrade request in src/index.ts after JWT verification
  const userId = ctx.req.userId;
  // If identity is missing, this event is not allowed for the current socket
  if (!userId) {
    throw new Error('unauthorized');
  }
  return userId;
}
