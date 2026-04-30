# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a **two-package monorepo** with no root-level package manager — each package is independent, has its own `package.json`, lockfile (`yarn.lock`), and is run from its own directory.

- `client/` — Next.js (Pages Router) frontend, TypeScript, TailwindCSS, Clerk auth, SWR
- `server/` — Express + WebSocket backend, TypeScript, MongoDB/Mongoose, Zod, Clerk JWT verification, GCS signed uploads
- `.github/workflows/ci.yml` — CI runs only against `server/` (lint, typecheck, test, docker build). The client has no CI job.

## Common commands

All commands assume you `cd` into `client/` or `server/` first.

### Client (`cd client`)

```bash
yarn dev            # Next dev server with Turbopack on :3000
yarn build          # Production build (runs prebuild → format first)
yarn analyze        # Build with @next/bundle-analyzer enabled
yarn test           # Jest, single run, --maxWorkers=1 --forceExit
yarn test:watch     # Jest in watch mode
yarn test:crud      # Custom ts-node test runner: __tests__/test-runner.ts
yarn format         # Prettier-write components/ and pages/

# Run a single Jest file or test name
yarn test -- lib/__tests__/http-client-complete.test.ts
yarn test -- --testNamePattern="Experiences CRUD"
```

There is no separate `lint` script for the client; ESLint runs through Next's build-time check (currently disabled via `eslint.ignoreDuringBuilds`). TypeScript build errors are also bypassed in production via `typescript.ignoreBuildErrors: true` in `next.config.js` — do not rely on `next build` to catch type regressions.

Path alias: `@/*` → `client/*` (configured in `tsconfig.json` and Jest's `moduleNameMapper`).

### Server (`cd server`)

```bash
yarn dev            # ts-node-dev, watches src/index.ts
yarn build          # tsc → dist/
yarn start          # node dist/index.js
yarn typecheck      # tsc --noEmit
yarn lint           # ESLint over .ts/.js
yarn lint:ci        # ESLint with --max-warnings=0 (used in CI)
yarn test           # Jest (ts-jest, node env)
yarn test:coverage  # Jest with coverage; thresholds: branches 50, functions 50, lines/statements 60

# Run a single test file
yarn test src/services/__test__/jwt.test.ts

# Local MongoDB (Docker)
yarn db:up          # docker compose up -d mongo
yarn db:down        # docker compose down
yarn db:logs        # tail mongo logs
yarn db:ps          # list services

# Or via Make:  make db-up / make db-down / make db-logs / make db-ps

yarn load:test      # WebSocket load harness (scripts/ws-load-test.ts)
yarn migrate        # Data migration scaffold (scripts/migrate-data.ts)
```

CI (`.github/workflows/ci.yml`) runs `yarn lint:ci`, `yarn typecheck`, `yarn test --ci`, and `docker build` against `server/`.

Server tests live next to source under `src/**/__test__/**/*.test.ts` (note the singular `__test__`). Coverage thresholds are enforced — keep them passing.

## Architecture: HTTP-first, WebSocket-only-for-stats

The defining architectural decision in this repo is **protocol separation**:

- **HTTP REST** (under `${API_BASE}/...`, default `/api/v1`) handles all CRUD: projects, assets, messages, technologies, experiences, resumes, badges. Routes are mounted in `server/src/routes/index.ts`. Each route module validates payloads with Zod schemas from `server/src/schemas/index.ts` and uses `authMiddleware` (`server/src/services/auth.ts`) for mutating routes.
- **WebSocket** (mounted at `${API_BASE}/ws`) is intentionally restricted to `system:ping`, `stats:get`, `stats:subscribe`. CRUD-over-WS is deprecated. The WS handshake optionally verifies a Clerk JWT (via `Sec-WebSocket-Protocol: bearer,<token>` or `?token=` query) but does **not** require auth — anonymous stats viewers are allowed.

When adding new data operations, **always** add an HTTP route — do not add new WebSocket events for CRUD.

### Server bootstrap (`server/src/index.ts`)

- One Express app + one `http.Server`; the `WebSocketServer` is attached to the same server so HTTP and WS share a port.
- Mongoose connects before the server starts listening; readiness probe (`/readyz`) reports 503 until `mongoose.connection.readyState === 1`.
- On boot, `MongoProjectsRepo`, `MongoAssetsRepo`, `MongoTechnologiesRepo` each call `ensureIndexes()`. Add new repos to this list when adding indexed collections.
- Graceful shutdown on `SIGTERM` (Cloud Run lifecycle): closes WS sockets with code 1001, then `server.close()`.
- `connections: Set<WebSocket>` is exposed to handlers via `setGetConnections` so `stats:*` events can report live counts.

### Auth boundary

- Frontend uses **Clerk** (`@clerk/nextjs`) — see `client/pages/_app.tsx` (ClerkProvider) and `client/hooks/useClerkAuth.ts`. Tokens are obtained from Clerk and passed as `Bearer` to the server.
- Server verifies tokens via `jose` against Clerk's JWKS. `CLERK_ISSUER` is required; `CLERK_JWKS_URL` is derived as `${issuer}/.well-known/jwks.json` if not set. `CLERK_AUDIENCE` is enforced when configured. See `server/src/services/jwt.ts` and `server/src/config/index.ts`.
- HTTP middleware: `authMiddleware` in `server/src/services/auth.ts` attaches `req.userId` from `claims.sub`. Apply it per-route on mutating endpoints (it is **not** mounted globally).

### Asset uploads

The upload flow is: client → `POST /api/v1/assets/request-upload` (auth) → server returns a GCS V4 signed PUT URL → client `PUT`s file directly to GCS → client → `POST /api/v1/assets/confirm` (auth) to record the asset. Implemented in `server/src/routes/assets.ts`, `server/src/services/gcs.ts`, and consumed from `client/lib/http-client.ts` (`uploadAsset` helper). Allowed MIME types and max size come from `ALLOWED_UPLOAD_MIME` / `MAX_UPLOAD_MB` env.

### Client data layer

- `client/lib/http-client.ts` is the single typed HTTP client. All components and hooks should go through it — do not call `fetch` directly from components.
- `client/hooks/useHttpApi.ts` exposes the generic `useApiQuery<T>` pattern plus per-resource hooks (`useProjects`, `useExperiences`, etc.). Components call these hooks; they do **not** consume a context provider for data.
- `client/hooks/useStats.ts` + `client/lib/stats-websocket.ts` is the only WebSocket consumer.
- `client/types/api.ts` is the source of truth for shared API shapes. The Project type carries legacy compatibility fields (`projectTitle`, `pictureUrl`, etc.) alongside modern ones (`title`, `heroImageUrl`) — both can be present in older documents.

### CORS / origins

`server/src/index.ts` allows any `http://localhost:*`, plus origins from `WS_ORIGINS` (CSV; `*` allowed). Adjust this env when adding a new deployed frontend origin — do not hardcode origins in code.

## Environment

### Server `.env` (in `server/`)

Minimum to boot locally with auth disabled flows working:
```
NODE_ENV=development
PORT=5000
API_BASE=/api/v1
WS_ORIGINS=http://localhost:3000
MONGODB_URI=                       # falls back to mongodb://localhost:27017/portfolio in dev
CLERK_ISSUER=https://YOUR-CLERK-ISSUER
CLERK_AUDIENCE=YOUR-CLERK-AUDIENCE
GCS_BUCKET_UPLOADS=your-bucket     # required for uploads
ALLOWED_UPLOAD_MIME=image/png,image/jpeg,image/webp
MAX_UPLOAD_MB=20
RATE_LIMIT_RPM=120
```

For GCS signed URLs, Application Default Credentials must be available — locally run `gcloud auth application-default login` or set `GOOGLE_APPLICATION_CREDENTIALS`.

### Client `.env` (in `client/`)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:5000/api/v1/ws
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
```

`client/lib/api.ts` normalizes `NEXT_PUBLIC_API_BASE_URL` and will append `/api/v1` if missing — but prefer setting it explicitly.

## Conventions and gotchas

- **Server tests path:** `src/**/__test__/**/*.test.ts` (singular `__test__`). New tests must use this folder name or Jest will not pick them up.
- **Client tests path:** `**/__tests__/**` (plural). Both client `__tests__/` directories and `*.test.ts(x)` files are matched.
- **Docs in `client/`** like `OPTIMIZATION.md`, `ICON_MIGRATION.md`, `DASHBOARD_README.md`, `DEPENDENCY_CLEANUP.md`, `CHANGELOG.md` are historical artifacts of past refactors and may be out of date — read the current code first, treat these as background only.
- **Two READMEs** — the root `README.md` documents the WebSocket→HTTP refactor as a narrative; `server/README.md` is the authoritative reference for endpoints, env vars, and WS events; `client/README.md` is partially out of date (mentions NextAuth.js — actual auth is Clerk).
- **`tailwind.config.js.backup`** in `client/` indicates a Tailwind v4 migration; the active config lives in `postcss.config.mjs` and the `@tailwindcss/postcss` plugin. Don't reintroduce a `tailwind.config.js`.
- **Turbopack** is the active dev bundler (`next dev --turbo`). Webpack-specific tweaks in `next.config.js` will not apply in dev.
- **`next.config.js` ignores TS and ESLint errors at build time** — run `tsc` (client has no script, use `npx tsc --noEmit`) and Jest explicitly to catch regressions before pushing.
