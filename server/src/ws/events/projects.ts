/**
 * Project event handlers.
 * - list: public, filterable with kind/tags/search; cursor pagination
 * - get: public by id/slug
 * - create: authenticated; slug uniqueness enforced; ownerId from ctx
 * - update/delete: authenticated; basic ownership checks can be added later
 */
import type { WebSocket } from 'ws';
import type { Schemas } from '../../schemas';
import { Project } from '../../models/Project';
import { send } from '../types';
import type { RequestContext } from '../../lib/context';
import { requireAuth } from '../authz';

export function registerProjectEvents(schemas: Schemas) {
  return {
    /**
     * Handle `projects:list`
     * - Validates request
     * - Builds a dynamic filter based on optional kind/tags/search
     * - Applies naive cursor pagination on `_id` (monotonic growth)
     * - Returns items plus a `nextCursor` when more data is available
     */
    async list(socket: WebSocket, payload: unknown) {
      const req = schemas.ProjectsListReq.parse(payload);

      // Build a dynamic Mongo filter
      const filter: Record<string, unknown> = {};
      if (req.filter?.kind) filter.kind = req.filter.kind;
      if (req.filter?.tags?.length) filter.tags = { $in: req.filter.tags } as { $in: string[] };
      if (req.filter?.search)
        filter.title = { $regex: req.filter.search, $options: 'i' } as {
          $regex: string;
          $options: string;
        };

      // Page size with sane default and upper bound enforced by schema (<= 50)
      const limit = req.limit ?? 20;

      // Cursor paging using _id; client provides last seen id as `cursor`
      const cursorFilter = req.cursor ? { _id: { $gt: req.cursor } } : {};

      // Query and lean for plain JSON objects
      const items = await Project.find({ ...filter, ...cursorFilter })
        .limit(limit)
        .lean();

      // If we filled the page, expose a nextCursor to continue
      const last = items[items.length - 1] as { _id?: unknown } | undefined;
      const nextCursor =
        items.length === limit && last && last._id ? String(last._id as string) : undefined;

      return send(socket, 'projects:list', { items, nextCursor });
    },

    /**
     * Handle `projects:get`
     * - Supports lookup by `id` or `slug`
     * - Returns `{ project: null }` if not found
     */
    async get(socket: WebSocket, payload: unknown) {
      const req = schemas.ProjectsGetReq.parse(payload);
      const project = req.id
        ? await Project.findById(req.id).lean()
        : req.slug
          ? await Project.findOne({ slug: req.slug }).lean()
          : null;
      return send(socket, 'projects:get', { project: project ?? null });
    },

    /**
     * Handle `projects:create`
     * - Requires authentication
     * - Enforces slug uniqueness
     * - Sets `ownerId` from authenticated user
     */
    async create(socket: WebSocket, payload: unknown, ctx: RequestContext) {
      const userId = requireAuth(ctx);
      const req = schemas.ProjectsCreateReq.parse(payload);

      // Ensure unique slug
      const exists = await Project.findOne({ slug: req.data.slug }).lean();
      if (exists) return send(socket, 'system:error', { message: 'slug already exists' });

      // Persist with ownerId from auth context
      const project = await Project.create({ ...req.data, ownerId: userId });
      return send(socket, 'projects:create', { project });
    },

    /**
     * Handle `projects:update`
     * - Requires authentication
     * - Applies partial updates, returning the new document
     * - Enforces ownership: only owner can update
     */
    async update(socket: WebSocket, payload: unknown, ctx: RequestContext) {
      const userId = requireAuth(ctx);
      const req = schemas.ProjectsUpdateReq.parse(payload);

      const current = await Project.findById(req.id).lean();
      if (!current) return send(socket, 'system:error', { message: 'project not found' });
      // Optional role-based override: allow if token has role admin/editor
      const roleAllowed = false;
      if (current.ownerId !== userId && !roleAllowed) {
        return send(socket, 'system:error', { message: 'forbidden' });
      }

      const project = await Project.findByIdAndUpdate(req.id, req.data, { new: true }).lean();
      return send(socket, 'projects:update', { project });
    },

    /**
     * Handle `projects:delete`
     * - Requires authentication
     * - Deletes by id; returns `{ ok: true }` for idempotency
     * - Enforces ownership: only owner can delete
     */
    async remove(socket: WebSocket, payload: unknown, ctx: RequestContext) {
      const userId = requireAuth(ctx);
      const req = schemas.ProjectsDeleteReq.parse(payload);

      const current = await Project.findById(req.id).lean();
      if (!current) return send(socket, 'projects:delete', { ok: true });
      const roleAllowed = false; // same rationale as update
      if (current.ownerId !== userId && !roleAllowed) {
        return send(socket, 'system:error', { message: 'forbidden' });
      }

      await Project.findByIdAndDelete(req.id);
      return send(socket, 'projects:delete', { ok: true });
    },
  } as const;
}
