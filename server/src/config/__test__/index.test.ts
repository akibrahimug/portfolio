import config from '..';
void config; // prevent unused var lint in this file

describe('config', () => {
  it('derives JWKS URL from issuer when unset', async () => {
    await jest.isolateModulesAsync(async () => {
      process.env.CLERK_ISSUER = 'https://issuer.example';
      delete process.env.CLERK_JWKS_URL;
      const mod = await import('..');
      const cfg = mod.default;
      expect(cfg.clerk.jwksUrl).toBe('https://issuer.example/.well-known/jwks.json');
    });
  });

  it('parses WS_ORIGINS CSV', async () => {
    await jest.isolateModulesAsync(async () => {
      process.env.WS_ORIGINS = 'http://a,http://b';
      const cfg = (await import('..')).default;
      expect(cfg.wsOrigins).toEqual(['http://a', 'http://b']);
    });
  });
});
