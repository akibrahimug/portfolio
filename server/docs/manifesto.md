# Portfolio Backend Manifesto

This document explains the architecture, decisions, and how to operate the new WebSocket‑first, type‑safe backend.

## Goals
- WebSocket‑first API; HTTP only for health and readiness (and optional /stats)
- Type safety end‑to‑end with TypeScript + Zod validation
- Stateless, Cloud Run‑friendly, cost‑efficient (~$20/mo target)
- Direct browser→GCS uploads via V4 signed URLs
- Clerk‑fronted auth using short‑lived JWTs verified on the backend via JWKS (no server SDK)

## High‑level Architecture
- Node.js + TypeScript service on Cloud Run
- MongoDB Atlas (Mongoose) for data (Projects, Assets, Users mirror)
- Google Cloud Storage for assets (V4 signed PUT URLs)
- Auth: Clerk on frontend → short‑lived JWT → jose/JWKS verify on handshake and sensitive actions
- Observability: Bunyan logs to stdout; future: OpenTelemetry metrics + Sentry

## Directory Layout
- src/
  - config/: typed env config via Zod
  - infra/: Mongo/Mongoose connection
  - models/: Mongoose models (Project, Asset)
  - schemas/: Zod schemas for entities and event payloads (v1)
  - services/: GCS signed URL, JWT verify (jose)
  - ws/: WebSocket server, handlers, and modular event registries
- docs/: events catalog, ADRs, observability, migration, manifesto
- .github/workflows: CI and deploy pipelines

## Events (v1)
Validated with Zod, envelope `{ event, payload }`:
- system:ping { version, ts } → { pong: true, ts, latencyMs }
- auth:hello { version, token } → { user, issuedAt } (placeholder echo)
- projects:list|get|create|update|delete
- assets:requestUpload|confirm
- stats:get|subscribe (planned)

## Auth Model
- Frontend: Clerk issues short‑lived JWTs using a JWT Template
- Backend: verify JWT via jose with JWKS (issuer/audience enforced)
- WebSocket handshake extracts token from Sec‑WebSocket‑Protocol (preferred) or `?token=`
- Sensitive events require authenticated socket; future: role checks via claims

## Uploads
- assets:requestUpload validates contentType/size against config; issues V4 signed URL
- Client uploads directly to GCS
- assets:confirm records Asset document with path and metadata

## Health & Readiness
- /api/v1/healthz: service, version, env, uptime, memory, paths
- /api/v1/readyz: db connectivity, active connections

## CI/CD
- CI: lint, typecheck, test, docker build
- Deploy: build → push to Artifact Registry → deploy to Cloud Run (staging) → /readyz gate → manual prod promotion

## Decisions (ADRs)
- No PM2 on Cloud Run (single process, graceful SIGTERM)
- MongoDB Atlas over Firestore (DX, aggregation)
- Redis deferred (add only if cross‑instance pub/sub needed)
- Direct GCS uploads (save egress, improve UX)

## Local Dev
- docker‑compose for MongoDB standalone on :27017
- npm scripts/Makefile for db up/down/logs
- Default port 5000; base path /api/v1; WS at /api/v1/ws

## Config
- Zod‑validated env in `src/config` with defaults
- Key envs: PORT, API_BASE, WS_ORIGINS, MONGODB_URI/DATABASE_URL, GCS_BUCKET_UPLOADS,
  CLERK_ISSUER, CLERK_JWKS_URL, CLERK_AUDIENCE, ALLOWED_UPLOAD_MIME, MAX_UPLOAD_MB

## Testing (planned)
- Unit: Zod validators, repo operations, signed URL service, JWT verify
- Integration: WS handshake/auth; projects CRUD; upload flow (mock GCS)
- Reliability: SIGTERM during active connections → auto‑reconnect

## Cost Controls
- Cloud Run min instances 0–1; concurrency ~80; 15m timeout for WS
- MongoDB Atlas M0/M2 initial
- No Redis unless broadcast scale demands it

## Migration Notes
- Legacy REST routes remain until WS parity achieved
- Data migration script outlined in docs/README-migration.md
