import { initSentry } from '../sentry';

describe('sentry', () => {
  it('does not throw when DSN is missing', () => {
    const prev = process.env.SENTRY_DSN;
    delete process.env.SENTRY_DSN;
    expect(() => initSentry()).not.toThrow();
    process.env.SENTRY_DSN = prev;
  });
});
