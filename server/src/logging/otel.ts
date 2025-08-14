/**
 * OpenTelemetry metrics bootstrap (optional).
 * - Exports runtime metrics via OTLP HTTP if endpoint is configured
 */
import { metrics } from '@opentelemetry/api';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import config from '../config';

// Track whether metrics have been initialized
let started = false;

/**
 * Initialize OpenTelemetry metrics if not already started and endpoint is configured.
 * Sets up:
 * - OTLP HTTP exporter pointing to configured endpoint
 * - Periodic metric reader that exports every 15 seconds
 * - Global meter provider for collecting metrics
 */
export function startMetrics(): void {
  // Skip if already initialized or no endpoint configured
  if (started || !config.otel.endpoint) return;

  // Create exporter that will send metrics to the OTLP endpoint
  const exporter = new OTLPMetricExporter({ url: `${config.otel.endpoint}/v1/metrics` });

  // Configure reader to collect and export metrics every 15 seconds
  const reader = new PeriodicExportingMetricReader({ exporter, exportIntervalMillis: 15000 });

  // Create meter provider to collect metrics
  const meterProvider = new MeterProvider({});

  // Some older typings may not include addMetricReader; feature-detect to avoid TS mismatch
  const maybeProvider = meterProvider as unknown as { addMetricReader?: (r: unknown) => void };
  if (typeof maybeProvider.addMetricReader === 'function') {
    maybeProvider.addMetricReader(reader);
  }

  // Set as global provider so metrics can be collected anywhere
  metrics.setGlobalMeterProvider(meterProvider);
  started = true;
}
