"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContext = buildContext;
/**
 * Build a new context instance. Keep this minimal and immutable.
 */
function buildContext({ requestId, log, req, userId }) {
    return { requestId, log, req, userId };
}
//# sourceMappingURL=context.js.map