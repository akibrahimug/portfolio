import { recordEvent, snapshot } from '../metrics';

describe('metrics', () => {
  it('records events and computes snapshot', () => {
    recordEvent(10, true);
    recordEvent(20, false);
    const s = snapshot(1);
    expect(s.connections).toBe(1);
    expect(s.p95ms).toBeGreaterThanOrEqual(10);
  });
});
