/**
 * JWT verification using JOSE and remote JWKS.
 * - Caches the JWKS fetcher in-process
 * - Enforces issuer and audience
 * - Throws on invalid signature/claims; callers handle and close the socket
 */
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import config from '../config';

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

/**
 * Lazily create and cache the JWKS remote set based on config.
 */
function getJwks() {
  if (!config.clerk.jwksUrl)
    throw new Error('[[CLERK_JWKS_URL]]-[SERVER]: CLERK_JWKS_URL (or CLERK_ISSUER) is required');
  if (!jwks) jwks = createRemoteJWKSet(new URL(config.clerk.jwksUrl));
  return jwks;
}

/**
 * Verify a JWT and return its payload when valid.
 * Consumers typically read `payload.sub` for user id and optional custom claims.
 */
export async function verifyTokenOrThrow(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getJwks(), {
    issuer: config.clerk.issuer,
    audience: config.clerk.audience,
    clockTolerance: 5, // seconds of leeway for clock skew
  });
  return payload;
}
