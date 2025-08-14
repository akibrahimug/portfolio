# Portfolio Backend (WS-first, TypeScript, MongoDB)

Badges: Node.js 20, TypeScript 5, WebSocket, MongoDB/Mongoose, Google Cloud Storage, Cloud Run, Jest

### What is this?

A WebSocket‑first backend powering a portfolio application. It exposes a minimal HTTP surface for health/readiness and a strongly‑typed WS API for all app interactions (projects, assets, stats). Authentication is performed during the WS handshake using Clerk‑issued JWTs validated via JWKS. File uploads are done directly from the browser to Google Cloud Storage using V4 signed URLs issued by the server.

### Key features

- WS‑first API mounted under `/api/v1/ws` with Zod‑validated payloads
- Minimal HTTP endpoints: health, readiness, and lightweight stats
- MongoDB with Mongoose, automatic index creation at startup
- Auth via Clerk (issuer/audience), verified with JOSE against remote JWKS
- Direct uploads to GCS via V4 signed URLs; server never proxies bytes
- In‑memory rate limiting with configurable RPM
- Optional Sentry and OpenTelemetry metrics export
- Cloud Run ready Docker image with healthcheck and graceful shutdown

## Getting started (local)

### Prerequisites

- Node.js ≥ 18.17 (Node 20 recommended)
- Docker (for local MongoDB)
- A Clerk instance (JWTs) and a GCP project (for GCS, optional locally)

### 1) Install dependencies

```bash
cd server
npm ci
```

### 2) Configure environment

Create a `.env` file in `server/` with at least the following keys. Minimal local config:

```env
# Core
NODE_ENV=development
PORT=5000
SERVICE_NAME=portfolio-backend
API_BASE=/api/v1

# WebSocket/CORS
WS_ORIGINS=http://localhost:3000

# Database (choose one; falls back to local when empty in non-prod)
MONGODB_URI=
DATABASE_URL=

# Auth (Clerk)
CLERK_ISSUER=https://YOUR-CLERK-ISSUER
CLERK_AUDIENCE=YOUR-CLERK-AUDIENCE
# Optionally override derived JWKS URL
# CLERK_JWKS_URL=https://.../.well-known/jwks.json

# GCS (optional locally; required for uploads in prod)
GCS_BUCKET_UPLOADS=your-bucket

# Upload policy
ALLOWED_UPLOAD_MIME=image/png,image/jpeg,image/webp
MAX_UPLOAD_MB=20

# Telemetry (optional)
OTEL_EXPORTER_OTLP_ENDPOINT=

# Rate limit
RATE_LIMIT_RPM=120
```

Notes:

- When `MONGODB_URI` and `DATABASE_URL` are unset and `NODE_ENV !== production`, the server uses `mongodb://localhost:27017/portfolio`.
- `CLERK_JWKS_URL` is derived automatically from `CLERK_ISSUER` if not provided.

### 3) Start MongoDB locally

```bash
make db-up          # docker compose up -d mongo
make db-logs        # follow logs
make db-ps          # list services
# make db-down      # stop and remove containers
```

### 4) Run the server

```bash
npm run dev         # ts-node-dev on src/index.ts
# npm run build && npm start  # compile to dist/ and run
```

### Validation, tests, formatting

```bash
npm run typecheck
npm run lint && npm run format:check
npm test            # or: npm run test:coverage
```

## WebSocket API

### Connection

- URL: `ws://localhost:5000/api/v1/ws` (base path configurable via `API_BASE`)
- Auth during handshake (required for mutating events):
  - Prefer header `Sec-WebSocket-Protocol: bearer, <JWT>`
  - Or query param `?token=<JWT>`

### Envelope

All frames are JSON objects of the form:

```json
{
  "event": "<namespace:name>",
  "payload": {
    /* data */
  }
}
```

Server responses mirror the request event name.

### Supported events

- system:ping → payload `{ ts: number }` → returns `{ pong: true, ts, latencyMs }`
- auth:hello → echo placeholder (identity established at handshake)
- projects:list → filterable list with cursor pagination; returns `{ items, nextCursor }`
- projects:get → by `id` or `slug`; returns `{ project | null }`
- projects:create → authenticated; enforces unique `slug`; sets `ownerId`
- projects:update → authenticated; owner‑only by default
- projects:delete → authenticated; owner‑only
- assets:requestUpload → authenticated; validates size/MIME; returns `{ uploadUrl, objectPath, headers, expiresAt }`
- assets:confirm → authenticated; persists `Asset` with uploaded object path
- stats:get → returns a one‑off metrics snapshot
- stats:subscribe → streams snapshots every `intervalMs` (default 5000)

Rate limiting: sensitive events use an in‑memory limiter keyed by `userId`. Configure with `RATE_LIMIT_RPM`. On limit, the server responds with `system:error` `{ message: "rate_limited" }`.

## HTTP endpoints

- GET `${API_BASE}/healthz` → liveness and metadata
- GET `${API_BASE}/readyz` → readiness (Mongo + WS count)
- GET `${API_BASE}/stats` → same shape as `stats:get`

## Data and models

- MongoDB via Mongoose; models live under `src/models/`. Indexes are ensured at startup.
- Repositories for Mongo are under `src/repos/mongo/`.

## Configuration reference (env)

- Core: `NODE_ENV`, `PORT` (default 5000), `SERVICE_NAME`, `API_BASE`
- CORS/WS: `WS_ORIGINS` (CSV list, defaults to `*`)
- Database: `MONGODB_URI` or `DATABASE_URL` (both supported)
- Auth: `CLERK_ISSUER`, `CLERK_AUDIENCE`, `CLERK_JWKS_URL` (optional)
- GCS: `GCS_BUCKET_UPLOADS`
- Upload policy: `ALLOWED_UPLOAD_MIME` (CSV), `MAX_UPLOAD_MB`
- Telemetry: `OTEL_EXPORTER_OTLP_ENDPOINT`
- Sentry: `SENTRY_DSN`
- Rate limiting: `RATE_LIMIT_RPM`

## Production

### Container image

The provided multi‑stage `Dockerfile` compiles TypeScript and produces a lean Node 20‑slim runtime with a healthcheck. Default exposed port is 5000.

Build and run locally:

```bash
docker build -t portfolio-backend .
docker run --rm -p 5000:5000 --env-file .env portfolio-backend
```

### Cloud Run (GCP)

- Push the image to Artifact Registry and deploy to Cloud Run.
- Pass env vars individually (repeat `--set-env-vars` per key) and use Secret Manager for `MONGODB_URI`.
- Health endpoints: `${API_BASE}/healthz` and `${API_BASE}/readyz`.
- Graceful shutdown: SIGTERM closes WS sockets and stops accepting new connections.

See also:

- `docs/infra/cloud-run.md`
- `docs/infra/artifact-registry.md`
- `docs/infra/secret-manager.md`
- Architectural Decisions in `docs/adrs/`

## Troubleshooting

- Mongo connection: verify `MONGODB_URI` and that the `mongo` container is running (`make db-ps`).
- CORS/WS errors: set `WS_ORIGINS` to include your frontend origin(s).
- JWT verification: ensure correct `CLERK_ISSUER`/`CLERK_AUDIENCE`; the JWKS URL is derived automatically.
- GCS signed URLs: Application Default Credentials must be available in the runtime. Locally, set `GOOGLE_APPLICATION_CREDENTIALS` or run `gcloud auth application-default login`.
- OTEL exporter: set `OTEL_EXPORTER_OTLP_ENDPOINT` to enable metrics export.

## Scripts

- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm start`
- Tests: `npm test`, `npm run test:coverage`
- Lint/format: `npm run lint`, `npm run lint:fix`, `npm run format`, `npm run format:check`
- DB helpers: `npm run db:up`, `npm run db:logs`, `npm run db:ps`, `npm run db:down`
- Load test: `npm run load:test`
- Data migration scaffold: `npm run migrate`

## Directory structure

```text
server/
├─ Dockerfile
├─ docker-compose.yaml
├─ jest.config.ts
├─ Makefile
├─ package.json
├─ tsconfig.json
├─ README.md
├─ docs/
│  ├─ adrs/
│  ├─ infra/
│  ├─ code-map.md
│  ├─ events.md
│  ├─ manifesto.md
│  └─ observability.md
├─ scripts/
│  ├─ migrate-data.ts
│  └─ ws-load-test.ts
├─ src/
│  ├─ index.ts                 # HTTP + WS server bootstrap
│  ├─ config/
│  │  └─ index.ts              # Zod-validated env config
│  ├─ infra/
│  │  └─ mongoose.ts           # Mongoose connection
│  ├─ lib/
│  │  └─ context.ts            # Request context
│  ├─ logging/
│  │  ├─ metrics.ts            # In-memory metrics
│  │  ├─ otel.ts               # Optional OTEL exporter
│  │  └─ sentry.ts             # Optional Sentry init
│  ├─ models/
│  │  ├─ Asset.ts
│  │  └─ Project.ts
│  ├─ repos/
│  │  ├─ interfaces.ts
│  │  └─ mongo/
│  │     ├─ assetsRepo.ts
│  │     └─ projectsRepo.ts
│  ├─ schemas/
│  │  └─ index.ts              # Zod schemas for entities/events
│  ├─ services/
│  │  ├─ gcs.ts                # GCS V4 signed URL
│  │  └─ jwt.ts                # JWKS/JWT verify
│  ├─ test/
│  │  └─ server.ts             # Test helpers
│  └─ ws/
│     ├─ authz.ts              # requireAuth helper
│     ├─ handlers.ts           # WS router
│     ├─ rateLimit.ts
│     ├─ types.ts
│     └─ events/
│        ├─ assets.ts
│        ├─ projects.ts
│        └─ stats.ts
└─ dist/                        # Compiled JS (after build)
```

## Reference tables

### Environment variables

| Name                          | Description                                       | Default/Example                                                        |
| ----------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| `NODE_ENV`                    | Runtime environment                               | `development`                                                          |
| `PORT`                        | HTTP port                                         | `5000`                                                                 |
| `API_BASE`                    | Base path for HTTP and WS                         | `/api/v1`                                                              |
| `SERVICE_NAME`                | Logger/service name                               | `portfolio-backend`                                                    |
| `WS_ORIGINS`                  | CSV of allowed CORS/WS origins                    | `*`                                                                    |
| `MONGODB_URI`                 | Mongo connection string                           | In dev, falls back to `mongodb://localhost:27017/portfolio` when empty |
| `DATABASE_URL`                | Alternate env key for Mongo URI                   | empty                                                                  |
| `CLERK_ISSUER`                | Clerk issuer URL                                  | required for auth                                                      |
| `CLERK_AUDIENCE`              | Expected audience                                 | required for auth                                                      |
| `CLERK_JWKS_URL`              | JWKS URL; derived from issuer if omitted          | derived                                                                |
| `GCP_PROJECT_ID`              | GCP project id (optional)                         |                                                                        |
| `GCP_REGION`                  | GCP region (optional)                             |                                                                        |
| `GCP_ARTIFACT_REGISTRY_REPO`  | AR repo (optional)                                |                                                                        |
| `GCS_BUCKET_UPLOADS`          | Bucket for direct uploads                         | required for uploads                                                   |
| `ALLOWED_UPLOAD_MIME`         | CSV list of allowed MIME types                    | `image/png,image/jpeg,image/webp`                                      |
| `MAX_UPLOAD_MB`               | Max upload size in MB                             | `20`                                                                   |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP HTTP endpoint (metrics)                      | empty (disabled)                                                       |
| `SENTRY_DSN`                  | Sentry DSN (optional)                             | empty (disabled)                                                       |
| `RATE_LIMIT_RPM`              | Requests per minute per user for sensitive events | `120`                                                                  |

### NPM scripts

| Script                    | What it does                                 |
| ------------------------- | -------------------------------------------- |
| `dev`                     | Run TS in watch mode (`ts-node-dev`)         |
| `build`                   | Compile TypeScript to `dist/`                |
| `start`                   | Start compiled server (`node dist/index.js`) |
| `test`                    | Run unit/integration tests (Jest)            |
| `test:coverage`           | Run tests with coverage report               |
| `lint` / `lint:fix`       | Lint code and optionally fix                 |
| `format` / `format:check` | Format with Prettier or check formatting     |
| `db:up` / `db:down`       | Start/stop local Mongo via Docker Compose    |
| `db:logs` / `db:ps`       | Tail Mongo logs / show Compose services      |
| `load:test`               | WebSocket load test harness                  |
| `migrate`                 | Data migration scaffold                      |

### HTTP endpoints

| Method | Path                  | Purpose             | Notes                                 |
| ------ | --------------------- | ------------------- | ------------------------------------- |
| GET    | `${API_BASE}/healthz` | Liveness + metadata | 200 OK when up                        |
| GET    | `${API_BASE}/readyz`  | Readiness           | 200 OK when Mongo connected, else 503 |
| GET    | `${API_BASE}/stats`   | Snapshot metrics    | Mirrors `stats:get`                   |

### WebSocket events (v1)

| Event                  | Request (shape)                                                        | Response (shape)                                |
| ---------------------- | ---------------------------------------------------------------------- | ----------------------------------------------- | ------- |
| `system:ping`          | `{ version: 'v1', ts: number }`                                        | `{ pong: true, ts, latencyMs }`                 |
| `auth:hello`           | `{ version: 'v1', token: string }`                                     | `{ user, issuedAt }`                            |
| `projects:list`        | `{ version: 'v1', filter?, limit?, cursor? }`                          | `{ items: Project[], nextCursor? }`             |
| `projects:get`         | `{ version: 'v1', id? , slug? }`                                       | `{ project: Project                             | null }` |
| `projects:create`      | `{ version: 'v1', data: ProjectCreate }`                               | `{ project }`                                   |
| `projects:update`      | `{ version: 'v1', id: string, data: Partial<Project> }`                | `{ project }`                                   |
| `projects:delete`      | `{ version: 'v1', id: string }`                                        | `{ ok: true }`                                  |
| `assets:requestUpload` | `{ version: 'v1', projectId, filename, contentType, size }`            | `{ uploadUrl, objectPath, headers, expiresAt }` |
| `assets:confirm`       | `{ version: 'v1', projectId, objectPath, contentType, size, ownerId }` | `{ asset }`                                     |
| `stats:get`            | `{ version: 'v1' }`                                                    | `{ connections, epm, errorRate, p95ms }`        |
| `stats:subscribe`      | `{ version: 'v1', intervalMs? }`                                       | periodic push same as `stats:get`               |

## License

ISC

— Kasoma Ibrahim
