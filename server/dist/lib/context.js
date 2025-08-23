"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContext = buildContext;
/**
 * Build a new context instance. Keep this minimal and immutable.
 */
function buildContext({ requestId, log, req, userId }) {
    const child = log.child({ requestId });
    return { requestId, log: child, req, userId };
}
//# sourceMappingURL=context.js.map