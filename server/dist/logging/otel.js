"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMetrics = startMetrics;
/**
 * OpenTelemetry metrics bootstrap (optional).
 * - Exports runtime metrics via OTLP HTTP if endpoint is configured
 */
const api_1 = require("@opentelemetry/api");
const sdk_metrics_1 = require("@opentelemetry/sdk-metrics");
const exporter_metrics_otlp_http_1 = require("@opentelemetry/exporter-metrics-otlp-http");
const config_1 = __importDefault(require("../config"));
// Track whether metrics have been initialized
let started = false;
/**
 * Initialize OpenTelemetry metrics if not already started and endpoint is configured.
 * Sets up:
 * - OTLP HTTP exporter pointing to configured endpoint
 * - Periodic metric reader that exports every 15 seconds
 * - Global meter provider for collecting metrics
 */
function startMetrics() {
    // Skip if already initialized or no endpoint configured
    if (started || !config_1.default.otel.endpoint)
        return;
    // Create exporter that will send metrics to the OTLP endpoint
    const exporter = new exporter_metrics_otlp_http_1.OTLPMetricExporter({ url: `${config_1.default.otel.endpoint}/v1/metrics` });
    // Configure reader to collect and export metrics every 15 seconds
    const reader = new sdk_metrics_1.PeriodicExportingMetricReader({ exporter, exportIntervalMillis: 15000 });
    // Create meter provider to collect metrics
    const meterProvider = new sdk_metrics_1.MeterProvider({});
    // Some older typings may not include addMetricReader; feature-detect to avoid TS mismatch
    const maybeProvider = meterProvider;
    if (typeof maybeProvider.addMetricReader === 'function') {
        maybeProvider.addMetricReader(reader);
    }
    // Set as global provider so metrics can be collected anywhere
    api_1.metrics.setGlobalMeterProvider(meterProvider);
    started = true;
}
//# sourceMappingURL=otel.js.map