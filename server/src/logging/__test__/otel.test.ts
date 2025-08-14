import { startMetrics } from '../otel';

describe('otel', () => {
  it('starts metrics only when endpoint provided', () => {
    const prev = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    expect(() => startMetrics()).not.toThrow();
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = prev;
  });
});
