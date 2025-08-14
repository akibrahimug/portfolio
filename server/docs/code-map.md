# Code Map

High-level index of the codebase to help onboarding.

- `src/index.ts` — App entry, Express health/ready endpoints, WS server, JWT handshake, graceful shutdown.
- `src/config/index.ts` — Zod-validated env config; Mongo URI and JWKS derivation; upload policy.
- `src/infra/mongoose.ts` — Mongoose connection bootstrap and URI validation.
- `src/infra/mongo.ts` — Legacy native Mongo helper (unused; kept for reference).
- `src/models/Project.ts` — Mongoose Project schema (unique slug), timestamps.
- `src/models/Asset.ts` — Mongoose Asset schema (GCS object metadata), indexed by projectId.
- `src/schemas/index.ts` — Zod schemas: entities and all v1 event payloads.
- `src/services/jwt.ts` — jose/JWKS JWT verification; issuer/audience enforcement.
- `src/services/gcs.ts` — GCS V4 signed URL generator for direct uploads.
- `src/logging/metrics.ts` — In-memory metrics: p95 latency, EPM, error rate.
- `src/lib/context.ts` — Request context contract passed to WS handlers.
- `src/ws/types.ts` — Message envelope `{ event, payload }` and send helper.
- `src/ws/authz.ts` — `requireAuth` helper ensuring authenticated socket.
- `src/ws/handlers.ts` — Central WS router, Zod validation, metrics recording.
- `src/ws/events/projects.ts` — projects:list|get|create|update|delete handlers.
- `src/ws/events/assets.ts` — assets:requestUpload|confirm handlers.
- `src/ws/events/stats.ts` — stats:get|subscribe handlers.
- `docs/events.md` — Event catalog, request/response shapes.
- `docs/manifesto.md` — Architecture/decisions/operations overview.
- `docs/README-migration.md` — Data migration outline.
- `tests/*` — Unit tests for schemas, JWT service, and GCS service.
