# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a **two-package monorepo** with no root-level package manager — each package is independent, has its own `package.json`, lockfile (`yarn.lock`), and is run from its own directory.

- `client/` — Next.js (Pages Router) frontend, TypeScript, TailwindCSS, Clerk auth.
- `server/` — Express + WebSocket backend, TypeScript, MongoDB/Mongoose, Zod, Clerk JWT verification, GCS signed uploads.
- `docs/` — Architecture and design references (`design-inspiration.md`, `redesign.md`).
- `.github/workflows/ci.yml` — Server CI today; client CI is added by `FEATURE/typescript-strict`.

The public home page (`client/pages/index.tsx`) was rebuilt top-to-bottom on `FEATURE/full-redesign` — see `docs/redesign.md` for the architecture, content model, and what each section is.

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

There is no separate `lint` script for the client today; ESLint runs through Next's build-time check (currently disabled via `eslint.ignoreDuringBuilds`). TypeScript build errors are bypassed in production via `typescript.ignoreBuildErrors: true` in `next.config.js` — `FEATURE/typescript-strict` removes that and adds a `typecheck` script + a CI gate.

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

CI (`.github/workflows/ci.yml`) runs `yarn lint:ci`, `yarn typecheck`, `yarn test --ci`, and `docker build` against `server/`. Server tests live next to source under `src/**/__test__/**/*.test.ts` (note the singular `__test__`). Coverage thresholds are enforced — keep them passing.

## Architecture

### Public home page is static; backend serves the rest

After the `FEATURE/full-redesign` work, `client/pages/index.tsx` reads **all** content from two static files:

- `client/lib/redesign-content.ts` — every string on the home page (hero, stats, skills, work, showcase, process, experience, currently, about, contact).
- `client/lib/technologies.json` — the searchable Tech Showcase tile data.

The home page makes **one** call to the backend: the contact form in `Connect.tsx` posts to `POST /api/v1/messages` via `useCreateMessage()` from `hooks/useHttpApi.ts`. Everything else is rendered from the static modules.

The Cloud Run + MongoDB backend therefore still owns:

1. **Admin dashboard CRUD** under `/dashboard/*` (projects, experiences, technologies, badges, resumes, avatars, certifications, messages). These pages all read/write through `hooks/useHttpApi.ts`.
2. **Contact form submissions** — `POST /api/v1/messages`.
3. **Asset uploads** — three-step flow `request-upload` → direct PUT to GCS → `confirm`. See `client/lib/http-client.ts` (`uploadAsset`) and `server/src/routes/assets.ts`.
4. **Auth** — Clerk-issued JWTs verified server-side via JOSE/JWKS. `authMiddleware` in `server/src/services/auth.ts` attaches `req.userId` to mutating routes.

If the dashboard is retired and the contact form is replaced with a third-party form service (Formspree / Resend / EmailJS), the entire frontend can be deployed statically without the backend.

### HTTP-first, WebSocket-only-for-stats (server)

- **HTTP REST** (under `${API_BASE}/...`, default `/api/v1`) handles all CRUD: projects, assets, messages, technologies, experiences, resumes, badges. Routes are mounted in `server/src/routes/index.ts`. Each route module validates payloads with Zod schemas from `server/src/schemas/index.ts` and uses `authMiddleware` for mutating routes.
- **WebSocket** (mounted at `${API_BASE}/ws`) is intentionally restricted to `system:ping`, `stats:get`, `stats:subscribe`. CRUD-over-WS is deprecated. The handshake optionally verifies a Clerk JWT via `Sec-WebSocket-Protocol: bearer,<token>` or `?token=` but does **not** require auth — anonymous stats viewers are allowed.

When adding new data operations, **always** add an HTTP route — do not add WebSocket events for CRUD.

### Server bootstrap (`server/src/index.ts`)

- One Express app + one `http.Server`; the `WebSocketServer` is attached to the same server so HTTP and WS share a port.
- Mongoose connects before the server starts listening; readiness probe (`/readyz`) reports 503 until `mongoose.connection.readyState === 1`.
- On boot, `MongoProjectsRepo`, `MongoAssetsRepo`, `MongoTechnologiesRepo` each call `ensureIndexes()`. Add new repos to this list when adding indexed collections.
- Graceful shutdown on `SIGTERM` (Cloud Run lifecycle): closes WS sockets with code 1001, then `server.close()`.

### Client home page composition

`client/pages/index.tsx` composes 12 redesign components in this order:

```
Hero → StatsBand → TickerStrip → Skills → SelectedWork → Showcase
     → Process → Experience → TechShowcase → Currently → About → Connect
```

Plus `TopNav` (sticky, scroll-aware backdrop) and `ScrollProgress` (top spring-smoothed bar) above, and `RedesignFooter` below. The legacy `Footer.tsx` only renders on **non-home** routes (dashboards, sign-in/up) — see `pages/_app.tsx`.

Components live under `client/components/redesign/`. Theme is light/dark via `next-themes` — toggle in `TopNav` — and every motion is gated by `useReducedMotion()` from framer-motion.

### Auth boundary

- Frontend uses **Clerk** (`@clerk/nextjs`) — see `client/pages/_app.tsx` (`ClerkProvider`) and `client/hooks/useClerkAuth.ts`. Tokens are obtained from Clerk and passed as `Bearer` to the server.
- Server verifies tokens via `jose` against Clerk's JWKS. `CLERK_ISSUER` is required; `CLERK_JWKS_URL` is derived as `${issuer}/.well-known/jwks.json` if not set. `CLERK_AUDIENCE` is enforced when configured.
- HTTP middleware: `authMiddleware` in `server/src/services/auth.ts` attaches `req.userId` from `claims.sub`. Apply it per-route on mutating endpoints (it is **not** mounted globally).

### CORS / origins

`server/src/index.ts` allows any `http://localhost:*`, plus origins from `WS_ORIGINS` (CSV; `*` allowed). Adjust this env when adding a new deployed frontend origin — do not hardcode origins in code.

## Environment

### Server `.env` (in `server/`)

Minimum to boot locally:

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

The contact form on the home page and every dashboard route depend on `NEXT_PUBLIC_API_BASE_URL`. The Clerk publishable key is required for sign-in / dashboard routes and is also referenced at build time during `next build` (provide a dummy `pk_test_...` key in CI if you don't have a real one).

## Conventions and gotchas

- **Server tests path:** `src/**/__test__/**/*.test.ts` (singular `__test__`). New tests must use this folder name or Jest will not pick them up.
- **Client tests path:** `**/__tests__/**` (plural). Both client `__tests__/` directories and `*.test.ts(x)` files are matched.
- **Tailwind v4** is active via `@tailwindcss/postcss` in `postcss.config.mjs` plus `@theme inline` blocks in `client/styles/globals.css`. Don't reintroduce a `tailwind.config.js`.
- **Turbopack** is the active dev bundler (`next dev --turbo`). Webpack-specific tweaks in `next.config.js` will not apply in dev.
- **`next.config.js` ignores TS and ESLint errors at build time** today — run `tsc` (client has no `typecheck` script yet on `master`; `FEATURE/typescript-strict` adds one) and Jest explicitly to catch regressions before pushing.
- **The redesign deleted ~25 legacy files** (Header, HeroSection, ProfileDesc, Avarta, Bio, Projects, ProjectCard, TechStack-scroll, Methodologies, Contact, SocialMedia, AnimatedCardWrapper, Form, Pagination, NavButtons, MainHeader, the `portfolio/` subfolder, `lib/api.ts`, `lib/lightweight-animation.tsx`, `lib/validation.ts`, `pages/color-test.tsx`). If you are looking at older docs that mention these, treat them as historical.
- **Stale `client/` docs** like `OPTIMIZATION.md`, `ICON_MIGRATION.md`, `DASHBOARD_README.md`, `DEPENDENCY_CLEANUP.md`, `CHANGELOG.md`, `client/README.md` are historical artifacts of past refactors. Read the current code first.
