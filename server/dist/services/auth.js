"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyClientIdentity = verifyClientIdentity;
// Minimal backend stance: trust that auth is handled client-side by Clerk/IdP.
// Optionally validate signature if a JWKS endpoint is configured later.
async function verifyClientIdentity(token) {
    if (!token)
        return { authenticated: false };
    // Placeholder: accept presence of token. Add jose/jwks verification here if needed.
    return { authenticated: true };
}
//# sourceMappingURL=auth.js.map