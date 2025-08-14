"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenOrThrow = verifyTokenOrThrow;
/**
 * JWT verification using JOSE and remote JWKS.
 * - Caches the JWKS fetcher in-process
 * - Enforces issuer and audience
 * - Throws on invalid signature/claims; callers handle and close the socket
 */
const jose_1 = require("jose");
const config_1 = __importDefault(require("../config"));
let jwks = null;
/**
 * Lazily create and cache the JWKS remote set based on config.
 */
function getJwks() {
    if (!config_1.default.clerk.jwksUrl)
        throw new Error('CLERK_JWKS_URL (or CLERK_ISSUER) is required');
    if (!jwks)
        jwks = (0, jose_1.createRemoteJWKSet)(new URL(config_1.default.clerk.jwksUrl));
    return jwks;
}
/**
 * Verify a JWT and return its payload when valid.
 * Consumers typically read `payload.sub` for user id and optional custom claims.
 */
async function verifyTokenOrThrow(token) {
    const { payload } = await (0, jose_1.jwtVerify)(token, getJwks(), {
        issuer: config_1.default.clerk.issuer,
        audience: config_1.default.clerk.audience,
        clockTolerance: 5, // seconds of leeway for clock skew
    });
    return payload;
}
//# sourceMappingURL=jwt.js.map