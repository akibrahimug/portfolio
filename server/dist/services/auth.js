"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("./jwt");
/**
 * Express middleware that authenticates a Bearer token and attaches userId.
 * - On success: sets `req.userId` and calls next()
 * - On failure: responds 401/403 JSON
 */
async function authMiddleware(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
        if (!token)
            return res.status(401).json({ error: 'missing_token' });
        const claims = await (0, jwt_1.verifyTokenOrThrow)(token);
        req.userId = claims.sub;
        return next();
    }
    catch (err) {
        return res.status(403).json({ error: 'forbidden' });
    }
}
//# sourceMappingURL=auth.js.map