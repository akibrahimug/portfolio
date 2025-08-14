"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProjectEvents = registerProjectEvents;
const Project_1 = require("../../models/Project");
const types_1 = require("../types");
const authz_1 = require("../authz");
function registerProjectEvents(schemas) {
    return {
        /**
         * Handle `projects:list`
         * - Validates request
         * - Builds a dynamic filter based on optional kind/tags/search
         * - Applies naive cursor pagination on `_id` (monotonic growth)
         * - Returns items plus a `nextCursor` when more data is available
         */
        async list(socket, payload) {
            const req = schemas.ProjectsListReq.parse(payload);
            // Build a dynamic Mongo filter
            const filter = {};
            if (req.filter?.kind)
                filter.kind = req.filter.kind;
            if (req.filter?.tags?.length)
                filter.tags = { $in: req.filter.tags };
            if (req.filter?.search)
                filter.title = { $regex: req.filter.search, $options: 'i' };
            // Page size with sane default and upper bound enforced by schema (<= 50)
            const limit = req.limit ?? 20;
            // Cursor paging using _id; client provides last seen id as `cursor`
            const cursorFilter = req.cursor ? { _id: { $gt: req.cursor } } : {};
            // Query and lean for plain JSON objects
            const items = await Project_1.Project.find({ ...filter, ...cursorFilter })
                .limit(limit)
                .lean();
            // If we filled the page, expose a nextCursor to continue
            const nextCursor = items.length === limit ? String(items[items.length - 1]._id) : undefined;
            return (0, types_1.send)(socket, 'projects:list', { items, nextCursor });
        },
        /**
         * Handle `projects:get`
         * - Supports lookup by `id` or `slug`
         * - Returns `{ project: null }` if not found
         */
        async get(socket, payload) {
            const req = schemas.ProjectsGetReq.parse(payload);
            const project = req.id
                ? await Project_1.Project.findById(req.id).lean()
                : req.slug
                    ? await Project_1.Project.findOne({ slug: req.slug }).lean()
                    : null;
            return (0, types_1.send)(socket, 'projects:get', { project: project ?? null });
        },
        /**
         * Handle `projects:create`
         * - Requires authentication
         * - Enforces slug uniqueness
         * - Sets `ownerId` from authenticated user
         */
        async create(socket, payload, ctx) {
            const userId = (0, authz_1.requireAuth)(ctx);
            const req = schemas.ProjectsCreateReq.parse(payload);
            // Ensure unique slug
            const exists = await Project_1.Project.findOne({ slug: req.data.slug }).lean();
            if (exists)
                return (0, types_1.send)(socket, 'system:error', { message: 'slug already exists' });
            // Persist with ownerId from auth context
            const project = await Project_1.Project.create({ ...req.data, ownerId: userId });
            return (0, types_1.send)(socket, 'projects:create', { project });
        },
        /**
         * Handle `projects:update`
         * - Requires authentication
         * - Applies partial updates, returning the new document
         */
        async update(socket, payload, ctx) {
            (0, authz_1.requireAuth)(ctx);
            const req = schemas.ProjectsUpdateReq.parse(payload);
            const project = await Project_1.Project.findByIdAndUpdate(req.id, req.data, { new: true }).lean();
            if (!project)
                return (0, types_1.send)(socket, 'system:error', { message: 'project not found' });
            return (0, types_1.send)(socket, 'projects:update', { project });
        },
        /**
         * Handle `projects:delete`
         * - Requires authentication
         * - Deletes by id; returns `{ ok: true }` for idempotency
         */
        async remove(socket, payload, ctx) {
            (0, authz_1.requireAuth)(ctx);
            const req = schemas.ProjectsDeleteReq.parse(payload);
            await Project_1.Project.findByIdAndDelete(req.id);
            return (0, types_1.send)(socket, 'projects:delete', { ok: true });
        },
    };
}
//# sourceMappingURL=projects.js.map