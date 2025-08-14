// no imports needed; module is loaded inside isolateModules

describe('rateLimit', () => {
  it('allows within capacity then throttles for a new user', async () => {
    await jest.isolateModulesAsync(async () => {
      process.env.RATE_LIMIT_RPM = '2';
      const mod = await import('../rateLimit');
      const { __resetBucketsForTest: reset, consume } = mod as {
        __resetBucketsForTest: () => void;
        consume: (userId: string, cost?: number) => boolean;
      };
      reset();
      const u1 = 'user-a';
      expect(consume(u1)).toBe(true);
      expect(consume(u1)).toBe(true);
      expect(consume(u1)).toBe(false);
    });
  });
});
