// This test ensures config validation fails gracefully when JWKS is missing.
// We do not hit the network in unit tests.

describe('jwt verify', () => {
  it('throws when JWKS URL is missing', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock('../../config', () => ({
        __esModule: true,
        default: { clerk: { jwksUrl: undefined, issuer: undefined, audience: undefined } },
      }));
      const { verifyTokenOrThrow } = await import('../jwt');
      await expect(verifyTokenOrThrow('dummy')).rejects.toThrow();
    });
  });
});
