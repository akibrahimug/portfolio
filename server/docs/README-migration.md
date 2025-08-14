# Migration & Cutover

## Data Migration
- Export current relational data from Sequelize/Postgres as JSON.
- Use `scripts/migrate-data.ts` to insert into MongoDB Atlas: projects, assets.
- Map fields and generate slugs where missing; ensure unique index on `projects.slug`.

## Plan
- Verify WS parity for projects/assets flows in staging
- Run migration against Atlas
- Backfill/verify slugs and indexes
- Smoke test WS endpoints; run load test script

## Cutover
- Switch frontend WS endpoint to `/api/v1/ws`
- Monitor `/readyz` and `/stats` for first 30 minutes
- Validate logs; roll back if error rate > 2%

## Rollback
- Pin previous Cloud Run revision
- Revert frontend to prior WS endpoint
- Investigate logs/metrics and retry with a canary
