# Infra Overview

- Cloud Run: see cloud-run.md
- Artifact Registry: see artifact-registry.md
- Secret Manager: see secret-manager.md

## Environment Variables

Core:
- NODE_ENV, PORT, SERVICE_NAME, API_BASE

Auth:
- CLERK_ISSUER, CLERK_AUDIENCE (JWKS derived automatically; override CLERK_JWKS_URL if needed)

Database:
- MONGODB_URI (Secret Manager)

GCS:
- GCS_BUCKET_UPLOADS

Uploads Policy:
- ALLOWED_UPLOAD_MIME, MAX_UPLOAD_MB

Telemetry (optional):
- OTEL_EXPORTER_OTLP_ENDPOINT

Note: In Cloud Run deploys, pass each env on its own line using repeated `--set-env-vars` flags. Do not comma-separate.

## Health & Readiness
- /api/v1/healthz
- /api/v1/readyz
- /api/v1/stats
