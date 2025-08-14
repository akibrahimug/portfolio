// Placeholder module retained for potential future server-side token verification.

// Minimal backend stance: trust that auth is handled client-side by Clerk/IdP.
// Optionally validate signature if a JWKS endpoint is configured later.
export async function verifyClientIdentity(token: string | undefined) {
  if (!token) return { authenticated: false } as const;
  // Placeholder: accept presence of token. Add jose/jwks verification here if needed.
  return { authenticated: true } as const;
}
