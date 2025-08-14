"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
/**
 * Ensure the socket is authenticated.
 * @throws Error('unauthorized') when no userId is present
 * @returns userId string
 */
function requireAuth(ctx) {
    // The userId is attached to the upgrade request in src/index.ts after JWT verification
    const userId = ctx.req.userId;
    // If identity is missing, this event is not allowed for the current socket
    if (!userId) {
        throw new Error('unauthorized');
    }
    return userId;
}
//# sourceMappingURL=authz.js.map