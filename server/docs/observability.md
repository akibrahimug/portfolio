# Observability Guide

## Logging
- Bunyan logs to stdout with `requestId`, `event`, `durationMs`, `ok`, `userId`.
- In GCP, view in Cloud Logging; consider log-based metrics for error rates.

## Metrics
- In-memory metrics: connections, events/min, error rate, P95 latency.
- Optional OpenTelemetry export when `OTEL_EXPORTER_OTLP_ENDPOINT` is set.

## Dashboards (Cloud Monitoring)
- Create a dashboard with:
  - Gauge: Active WS connections (scrape `/api/v1/stats` via uptime check or collector)
  - Line: Events per minute
  - Line: Error rate (%)
  - Line: P95 latency (ms)

## Alerts
- Error rate > 2% over 5 minutes
- P95 latency > 300 ms over 5 minutes
- Readiness failing (Cloud Run) for 2 consecutive checks

## SLOs
- WS connect success ≥ 99%
- Event P95 latency ≤ 200 ms
- Error rate ≤ 1%

## Cost Notes
- Cloud Run: min instances 0–1; concurrency ≈ 80; timeout ≤ 900s for WS.
- MongoDB Atlas: start M0/M2; monitor CPU/IO; scale if sustained >70%.
- Avoid Redis until cross-instance broadcasts are required.
