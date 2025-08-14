/**
 * Zod Schemas for all entities and WebSocket event payloads (v1).
 *
 * Provides:
 * - Entity schemas: Project, Asset
 * - Request/Response schemas for each `event`
 * - Version enforcement via `{ version: 'v1' }` in all request payloads
 *
 * Usage:
 * - Handlers call `schemas.EventReq.parse(payload)` to validate
 * - Responses are shaped according to the corresponding `EventRes` schema
 */
import { z } from 'zod';

export function buildSchemas() {
  // Every request payload starts with `{ version: 'v1' }` for backwards compatibility
  const versionSchema = z.object({ version: z.literal('v1') });

  // Domain entity: Project
  const Project = z.object({
    _id: z.any().optional(),
    title: z.string(),
    slug: z.string(),
    kind: z.enum(['learning', 'frontend', 'fullstack', 'ai_learning']),
    description: z.string().optional(),
    techStack: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    heroImageUrl: z.string().nullable().optional(),
    visibility: z.enum(['public', 'private']).default('public'),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    ownerId: z.string(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    views: z.number().optional(),
    likes: z.number().optional(),
  });

  // Domain entity: Asset (GCS metadata)
  const Asset = z.object({
    _id: z.any().optional(),
    projectId: z.any(),
    ownerId: z.string(),
    path: z.string(),
    contentType: z.string(),
    size: z.number(),
    createdAt: z.string().optional(),
  });

  // Event payloads
  const AuthHelloReq = versionSchema.extend({ token: z.string() });
  const AuthHelloRes = z.object({
    user: z.object({ id: z.string(), email: z.string(), name: z.string().nullable().optional() }),
    issuedAt: z.string(),
  });

  // projects:list request/response
  const ProjectsListReq = versionSchema.extend({
    filter: z
      .object({
        kind: Project.shape.kind.optional(),
        tags: z.array(z.string()).optional(),
        search: z.string().optional(),
      })
      .optional(),
    limit: z.number().int().positive().max(50).optional(),
    cursor: z.string().optional(),
  });
  const ProjectsListRes = z.object({ items: z.array(Project), nextCursor: z.string().optional() });

  // projects:get request/response
  const ProjectsGetReq = versionSchema.extend({
    id: z.string().optional(),
    slug: z.string().optional(),
  });
  const ProjectsGetRes = z.object({ project: Project.nullable() });

  // projects:create – input DTO and wrappers
  const ProjectCreate = Project.pick({
    title: true,
    slug: true,
    kind: true,
    description: true,
    techStack: true,
    tags: true,
    heroImageUrl: true,
    visibility: true,
    status: true,
  }).extend({ ownerId: z.string() });
  const ProjectsCreateReq = versionSchema.extend({ data: ProjectCreate });
  const ProjectsCreateRes = z.object({ project: Project });

  // projects:update – partial DTO
  const ProjectUpdate = ProjectCreate.partial();
  const ProjectsUpdateReq = versionSchema.extend({ id: z.string(), data: ProjectUpdate });
  const ProjectsUpdateRes = z.object({ project: Project });

  // projects:delete
  const ProjectsDeleteReq = versionSchema.extend({ id: z.string() });
  const ProjectsDeleteRes = z.object({ ok: z.literal(true) });

  // assets:requestUpload – signed URL issuance
  const AssetsRequestUploadReq = versionSchema.extend({
    projectId: z.string(),
    filename: z.string(),
    contentType: z.string(),
    size: z.number(),
  });
  const AssetsRequestUploadRes = z.object({
    uploadUrl: z.string(),
    objectPath: z.string(),
    headers: z.record(z.string()),
    expiresAt: z.string(),
  });

  // assets:confirm – persist metadata
  const AssetsConfirmReq = versionSchema.extend({
    projectId: z.string(),
    objectPath: z.string(),
    contentType: z.string(),
    size: z.number(),
    ownerId: z.string(),
  });
  const AssetsConfirmRes = z.object({ asset: Asset });

  // stats:get
  const StatsGetReq = versionSchema;
  const StatsGetRes = z.object({
    connections: z.number(),
    epm: z.number(),
    errorRate: z.number(),
    p95ms: z.number(),
  });
  // stats:subscribe
  const StatsSubscribeReq = versionSchema.extend({
    intervalMs: z.number().int().positive().max(60_000).optional(),
  });

  // system:ping
  const SystemPingReq = versionSchema.extend({ ts: z.number() });
  const SystemPingRes = z.object({ pong: z.literal(true), ts: z.number(), latencyMs: z.number() });

  return {
    Project,
    Asset,
    AuthHelloReq,
    AuthHelloRes,
    ProjectsListReq,
    ProjectsListRes,
    ProjectsGetReq,
    ProjectsGetRes,
    ProjectsCreateReq,
    ProjectsCreateRes,
    ProjectsUpdateReq,
    ProjectsUpdateRes,
    ProjectsDeleteReq,
    ProjectsDeleteRes,
    AssetsRequestUploadReq,
    AssetsRequestUploadRes,
    AssetsConfirmReq,
    AssetsConfirmRes,
    StatsGetReq,
    StatsGetRes,
    StatsSubscribeReq,
    SystemPingReq,
    SystemPingRes,
  };
}

export type Schemas = ReturnType<typeof buildSchemas>;
