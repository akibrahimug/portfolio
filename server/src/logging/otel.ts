/**
 * OpenTelemetry metrics are disabled in this environment to avoid build issues.
 * This no-op preserves the public API while removing external OTEL imports.
 */
export function startMetrics(): void {
  // no-op
}
