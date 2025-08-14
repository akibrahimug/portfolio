"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSchemas = buildSchemas;
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
const zod_1 = require("zod");
function buildSchemas() {
    // Every request payload starts with `{ version: 'v1' }` for backwards compatibility
    const versionSchema = zod_1.z.object({ version: zod_1.z.literal('v1') });
    // Domain entity: Project
    const Project = zod_1.z.object({
        _id: zod_1.z.any().optional(),
        title: zod_1.z.string(),
        slug: zod_1.z.string(),
        kind: zod_1.z.enum(['learning', 'frontend', 'fullstack', 'ai_learning']),
        description: zod_1.z.string().optional(),
        techStack: zod_1.z.array(zod_1.z.string()).default([]),
        tags: zod_1.z.array(zod_1.z.string()).default([]),
        heroImageUrl: zod_1.z.string().nullable().optional(),
        visibility: zod_1.z.enum(['public', 'private']).default('public'),
        status: zod_1.z.enum(['draft', 'published', 'archived']).default('draft'),
        ownerId: zod_1.z.string(),
        createdAt: zod_1.z.string().optional(),
        updatedAt: zod_1.z.string().optional(),
        views: zod_1.z.number().optional(),
        likes: zod_1.z.number().optional(),
    });
    // Domain entity: Asset (GCS metadata)
    const Asset = zod_1.z.object({
        _id: zod_1.z.any().optional(),
        projectId: zod_1.z.any(),
        ownerId: zod_1.z.string(),
        path: zod_1.z.string(),
        contentType: zod_1.z.string(),
        size: zod_1.z.number(),
        createdAt: zod_1.z.string().optional(),
    });
    // Event payloads
    const AuthHelloReq = versionSchema.extend({ token: zod_1.z.string() });
    const AuthHelloRes = zod_1.z.object({
        user: zod_1.z.object({ id: zod_1.z.string(), email: zod_1.z.string(), name: zod_1.z.string().nullable().optional() }),
        issuedAt: zod_1.z.string(),
    });
    // projects:list request/response
    const ProjectsListReq = versionSchema.extend({
        filter: zod_1.z
            .object({
            kind: Project.shape.kind.optional(),
            tags: zod_1.z.array(zod_1.z.string()).optional(),
            search: zod_1.z.string().optional(),
        })
            .optional(),
        limit: zod_1.z.number().int().positive().max(50).optional(),
        cursor: zod_1.z.string().optional(),
    });
    const ProjectsListRes = zod_1.z.object({ items: zod_1.z.array(Project), nextCursor: zod_1.z.string().optional() });
    // projects:get request/response
    const ProjectsGetReq = versionSchema.extend({
        id: zod_1.z.string().optional(),
        slug: zod_1.z.string().optional(),
    });
    const ProjectsGetRes = zod_1.z.object({ project: Project.nullable() });
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
    }).extend({ ownerId: zod_1.z.string() });
    const ProjectsCreateReq = versionSchema.extend({ data: ProjectCreate });
    const ProjectsCreateRes = zod_1.z.object({ project: Project });
    // projects:update – partial DTO
    const ProjectUpdate = ProjectCreate.partial();
    const ProjectsUpdateReq = versionSchema.extend({ id: zod_1.z.string(), data: ProjectUpdate });
    const ProjectsUpdateRes = zod_1.z.object({ project: Project });
    // projects:delete
    const ProjectsDeleteReq = versionSchema.extend({ id: zod_1.z.string() });
    const ProjectsDeleteRes = zod_1.z.object({ ok: zod_1.z.literal(true) });
    // assets:requestUpload – signed URL issuance
    const AssetsRequestUploadReq = versionSchema.extend({
        projectId: zod_1.z.string(),
        filename: zod_1.z.string(),
        contentType: zod_1.z.string(),
        size: zod_1.z.number(),
    });
    const AssetsRequestUploadRes = zod_1.z.object({
        uploadUrl: zod_1.z.string(),
        objectPath: zod_1.z.string(),
        headers: zod_1.z.record(zod_1.z.string()),
        expiresAt: zod_1.z.string(),
    });
    // assets:confirm – persist metadata
    const AssetsConfirmReq = versionSchema.extend({
        projectId: zod_1.z.string(),
        objectPath: zod_1.z.string(),
        contentType: zod_1.z.string(),
        size: zod_1.z.number(),
        ownerId: zod_1.z.string(),
    });
    const AssetsConfirmRes = zod_1.z.object({ asset: Asset });
    // stats:get
    const StatsGetReq = versionSchema;
    const StatsGetRes = zod_1.z.object({
        connections: zod_1.z.number(),
        epm: zod_1.z.number(),
        errorRate: zod_1.z.number(),
        p95ms: zod_1.z.number(),
    });
    // stats:subscribe
    const StatsSubscribeReq = versionSchema.extend({
        intervalMs: zod_1.z.number().int().positive().max(60000).optional(),
    });
    // system:ping
    const SystemPingReq = versionSchema.extend({ ts: zod_1.z.number() });
    const SystemPingRes = zod_1.z.object({ pong: zod_1.z.literal(true), ts: zod_1.z.number(), latencyMs: zod_1.z.number() });
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
//# sourceMappingURL=index.js.map