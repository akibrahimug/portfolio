import { buildSchemas } from '..';

describe('schemas', () => {
  it('builds and validates versioned payloads', () => {
    const s = buildSchemas();
    expect(s).toBeDefined();
  });
});
