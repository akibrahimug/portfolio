"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordEvent = recordEvent;
exports.snapshot = snapshot;
/**
 * Minimal in-memory metrics for WS events.
 * - Track event durations (p95)
 * - Count events in last minute (EPM)
 * - Track simple error rate (events that threw)
 *
 * Suitable for local dev and basic visibility; for production use
 * OpenTelemetry and Cloud Monitoring for robust metrics.
 */
const durations = [];
const timestamps = []; // event timestamps for last 60s window
let errors = 0;
function trimOld(now) {
    // Keep only last 60s timestamps
    while (timestamps.length && now - timestamps[0] > 60000)
        timestamps.shift();
}
/**
 * Record the outcome and duration of one event.
 */
function recordEvent(durationMs, ok) {
    const now = Date.now();
    timestamps.push(now);
    trimOld(now);
    durations.push(durationMs);
    if (durations.length > 1000)
        durations.shift();
    if (!ok)
        errors += 1;
}
function p95(values) {
    if (values.length === 0)
        return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.ceil(0.95 * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
}
/**
 * Produce a snapshot for stats:get/subcribe responses.
 */
function snapshot(connections) {
    const now = Date.now();
    trimOld(now);
    const epm = timestamps.length; // events per last minute
    const total = durations.length || 1;
    const errorRate = errors / total;
    return {
        connections,
        epm,
        errorRate: Number(errorRate.toFixed(4)),
        p95ms: Math.round(p95(durations)),
    };
}
//# sourceMappingURL=metrics.js.map