/**
 * Zod Schemas for all entities and WebSocket event payloads (v1).
 *
 * Provides:
 * - Entity schemas: Project, Asset, Technology
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
    slug: z.string(),
    title: z.string(),
    // Keep legacy `kind` for compatibility while also supporting `category`
    kind: z.string().optional(),
    description: z.string().optional(),
    techStack: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    technologyIds: z.array(z.string()).default([]),
    heroImageUrl: z.string().nullable().optional(),
    liveUrl: z.string().url().or(z.literal('')).optional(),
    githubUrl: z.string().url().or(z.literal('')).optional(),
    repoUrl: z.string().url().or(z.literal('')).optional(),
    gradient: z.string().optional(),
    hasPreview: z.boolean().optional(),
    previewType: z.enum(['image', 'components', 'visualization', 'platform', 'game', 'music', 'ar', 'chart', 'dashboard', 'ecommerce', 'other']).optional(),
    category: z.string().optional(),
    duration: z.string().optional(),
    teamSize: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    importance: z.enum(['high', 'medium', 'low']).optional(),
    visibility: z.enum(['public', 'private']).default('public'),
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
        category: Project.shape.category.optional(),
        search: z.string().optional(),
      })
      .optional(),
    limit: z.number().int().positive().max(50).optional(),
    cursor: z.string().optional(),
  });
  const ProjectsListRes = z.object({ items: z.array(Project), nextCursor: z.string().optional() });

  // projects:get request/response
  const ProjectsGetReq = versionSchema.extend({ id: z.string().optional() });
  const ProjectsGetRes = z.object({ project: Project.nullable() });

  // projects:create – input DTO and wrappers
  const ProjectCreate = Project.pick({
    slug: true,
    title: true,
    kind: true,
    description: true,
    techStack: true,
    tags: true,
    technologyIds: true,
    heroImageUrl: true,
    liveUrl: true,
    githubUrl: true,
    repoUrl: true,
    gradient: true,
    hasPreview: true,
    previewType: true,
    category: true,
    duration: true,
    teamSize: true,
    status: true,
    importance: true,
    visibility: true,
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
    projectId: z.string().optional(),
    filename: z.string(),
    contentType: z.string(),
    size: z.number(),
    folder: z.string().optional(),
    assetType: z
      .enum([
        'project',
        'resume',
        'technology',
        'media',
        'avatar',
        'badge',
        'certification',
        'experience',
        'other',
      ])
      .optional(),
  });
  const AssetsRequestUploadRes = z.object({
    uploadUrl: z.string(),
    objectPath: z.string(),
    headers: z.record(z.string()),
    expiresAt: z.string(),
  });

  // assets:confirm – persist metadata
  const AssetsConfirmReq = versionSchema.extend({
    projectId: z.string().optional(),
    objectPath: z.string(),
    contentType: z.string(),
    size: z.number(),
    ownerId: z.string(),
    assetType: z
      .enum([
        'project',
        'resume',
        'technology',
        'media',
        'avatar',
        'badge',
        'certification',
        'experience',
        'other',
      ])
      .optional(),
  });
  const AssetsConfirmRes = z.object({ asset: Asset });

  // assets:browse – query string validation
  const AssetsBrowseQuery = z.object({
    prefix: z.string().optional(),
    limit: z
      .preprocess(
        (v) => (typeof v === 'string' ? Number(v) : v),
        z.number().int().positive().max(1000),
      )
      .optional(),
    type: z.enum(['image']).optional(),
  });

  // assets:folders – query string validation
  const AssetsFoldersQuery = z.object({
    prefix: z.string().optional(),
  });

  // assets:edit
  const AssetsEditReq = versionSchema.extend({ id: z.string(), data: Asset.partial() });
  const AssetsEditRes = z.object({ asset: Asset });

  // assets:delete
  const AssetsDeleteReq = versionSchema.extend({ id: z.string() });
  const AssetsDeleteRes = z.object({ ok: z.literal(true) });

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

  // technologies:list
  const TechnologiesListReq = versionSchema;
  const TechnologiesListRes = z.object({ technologies: z.array(z.any()) });

  // technologies:get
  const TechnologiesGetReq = versionSchema.extend({ id: z.string() });
  const TechnologiesGetRes = z.object({ technology: z.any() });

  // technologies:create
  const TechnologiesCreateReq = versionSchema.extend({ data: z.any() });
  const TechnologiesCreateRes = z.object({ technology: z.any() });

  // technologies:update
  const TechnologiesUpdateReq = versionSchema.extend({ id: z.string(), data: z.any().optional() });
  const TechnologiesUpdateRes = z.object({ technology: z.any() });

  // technologies:delete
  const TechnologiesDeleteReq = versionSchema.extend({ id: z.string() });
  const TechnologiesDeleteRes = z.object({ ok: z.literal(true) });

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
    AssetsEditReq,
    AssetsEditRes,
    AssetsDeleteReq,
    AssetsDeleteRes,
    AssetsBrowseQuery,
    AssetsFoldersQuery,
    StatsGetReq,
    StatsGetRes,
    StatsSubscribeReq,
    SystemPingReq,
    SystemPingRes,
    TechnologiesListReq,
    TechnologiesListRes,
    TechnologiesGetReq,
    TechnologiesGetRes,
    TechnologiesCreateReq,
    TechnologiesCreateRes,
    TechnologiesUpdateReq,
    TechnologiesUpdateRes,
    TechnologiesDeleteReq,
    TechnologiesDeleteRes,
  };
}

export type Schemas = ReturnType<typeof buildSchemas>;
