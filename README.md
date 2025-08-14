# Portfolio Monorepo

This repository hosts the portfolio application. The current focus is the backend service in `server/`, which is a WebSocket‑first Node.js/TypeScript API deployed to Cloud Run and backed by MongoDB.

### Structure

- `server/`: WS‑first backend (TypeScript, Mongoose, Clerk JWT auth, GCS uploads)
- `client/`: Frontend app (placeholder; not covered in this README)

### Repository tree

```text
portfolio/
├─ client/
├─ server/
│  ├─ Dockerfile
│  ├─ docker-compose.yaml
│  ├─ jest.config.ts
│  ├─ Makefile
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ README.md
│  ├─ docs/
│  ├─ scripts/
│  └─ src/
└─ README.md
```

### Quick start (backend)

```bash
cd server
npm ci
make db-up                 # start local MongoDB via Docker
cp .env .env.local || true # if you keep variants; otherwise create .env
npm run dev
```

Minimal `server/.env` example:

```env
NODE_ENV=development
PORT=5000
API_BASE=/api/v1
WS_ORIGINS=http://localhost:3000

# Mongo (leave empty in dev to use mongodb://localhost:27017/portfolio)
MONGODB_URI=
DATABASE_URL=

# Auth (Clerk)
CLERK_ISSUER=https://YOUR-CLERK-ISSUER
CLERK_AUDIENCE=YOUR-CLERK-AUDIENCE

# GCS (optional locally)
GCS_BUCKET_UPLOADS=your-bucket

ALLOWED_UPLOAD_MIME=image/png,image/jpeg,image/webp
MAX_UPLOAD_MB=20
RATE_LIMIT_RPM=120
```

Expose WS at `ws://localhost:5000/api/v1/ws`. Prefer `Sec-WebSocket-Protocol: bearer, <JWT>` during handshake; fallback `?token=` is supported.

### Backend reference tables

#### Environment variables

| Name                          | Description                              | Default/Example                                    |
| ----------------------------- | ---------------------------------------- | -------------------------------------------------- |
| `NODE_ENV`                    | Runtime environment                      | `development`                                      |
| `PORT`                        | HTTP port                                | `5000`                                             |
| `API_BASE`                    | Base path for HTTP and WS                | `/api/v1`                                          |
| `SERVICE_NAME`                | Logger/service name                      | `portfolio-backend`                                |
| `WS_ORIGINS`                  | CSV of allowed CORS/WS origins           | `*`                                                |
| `MONGODB_URI`                 | Mongo connection string                  | Dev fallback `mongodb://localhost:27017/portfolio` |
| `DATABASE_URL`                | Alternate env key for Mongo URI          | empty                                              |
| `CLERK_ISSUER`                | Clerk issuer URL                         | required for auth                                  |
| `CLERK_AUDIENCE`              | Expected audience                        | required for auth                                  |
| `CLERK_JWKS_URL`              | JWKS URL; derived from issuer if omitted | derived                                            |
| `GCS_BUCKET_UPLOADS`          | Bucket for direct uploads                | required for uploads                               |
| `ALLOWED_UPLOAD_MIME`         | CSV list of allowed MIME types           | `image/png,image/jpeg,image/webp`                  |
| `MAX_UPLOAD_MB`               | Max upload size in MB                    | `20`                                               |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP HTTP endpoint (metrics)             | empty (disabled)                                   |
| `SENTRY_DSN`                  | Sentry DSN (optional)                    | empty (disabled)                                   |
| `RATE_LIMIT_RPM`              | Requests per minute per user             | `120`                                              |

#### NPM scripts (from `server/`)

| Script                    | Purpose                                      |
| ------------------------- | -------------------------------------------- |
| `dev`                     | Run TS in watch mode (`ts-node-dev`)         |
| `build`                   | Compile TypeScript to `dist/`                |
| `start`                   | Start compiled server (`node dist/index.js`) |
| `test` / `test:coverage`  | Run Jest tests / with coverage               |
| `lint` / `lint:fix`       | Lint code and optionally fix                 |
| `format` / `format:check` | Format with Prettier or check formatting     |
| `db:up` / `db:down`       | Start/stop local Mongo (Docker Compose)      |
| `db:logs` / `db:ps`       | Tail Mongo logs / list services              |

### Docs

- Backend details, API, envs, deploy: see `server/README.md`
- Infra and ADRs: see `server/docs/`

### Scripts (backend)

Run from `server/`:

- Dev: `npm run dev`
- Build/Start: `npm run build` then `npm start`
- Tests: `npm test` or `npm run test:coverage`
- Lint/format: `npm run lint`, `npm run lint:fix`, `npm run format`, `npm run format:check`
- DB helpers: `npm run db:up`, `npm run db:logs`, `npm run db:ps`, `npm run db:down`

### Deployment (backend)

- Containerized via multi‑stage `Dockerfile` in `server/`
- Deploy to Cloud Run; pass env vars individually and use Secret Manager for `MONGODB_URI`
- Health endpoints: `/api/v1/healthz`, `/api/v1/readyz`

### License

ISC — Kasoma Ibrahim-
