"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoProjectsRepo = void 0;
const mongoose_1 = require("mongoose");
const console_1 = require("../../logging/console");
const Project_1 = require("../../models/Project");
const log = (0, console_1.getTaggedLogger)('REPO:PROJECTS');
class MongoProjectsRepo {
    async ensureIndexes() {
        const start = Date.now();
        await Project_1.Project.syncIndexes();
        log.info({ op: 'ensureIndexes', model: 'Project', durationMs: Date.now() - start }, 'indexes ensured');
    }
    async list(params) {
        const { filter, limit, cursor } = params;
        const start = Date.now();
        const query = {};
        if (filter?.kind)
            query.kind = filter.kind;
        if (filter?.tags?.length)
            query.tags = { $in: filter.tags };
        if (filter?.search)
            query.title = { $regex: filter.search, $options: 'i' };
        if (cursor)
            query._id = { $gt: new mongoose_1.Types.ObjectId(cursor) };
        const items = await Project_1.Project.find(query).limit(limit).lean();
        const nextCursor = items.length === limit
            ? String(items[items.length - 1]._id)
            : undefined;
        log.info({
            op: 'list',
            model: 'Project',
            filter,
            limit,
            cursor,
            count: items.length,
            nextCursor: Boolean(nextCursor),
            durationMs: Date.now() - start,
        }, 'projects list');
        return { items, nextCursor };
    }
    async getById(id) {
        const start = Date.now();
        const result = await Project_1.Project.findById(id).lean();
        log.info({ op: 'getById', id, found: Boolean(result), durationMs: Date.now() - start }, 'project getById');
        return result;
    }
    async getBySlug(slug) {
        const start = Date.now();
        const result = await Project_1.Project.findOne({ slug }).lean();
        log.info({ op: 'getBySlug', slug, found: Boolean(result), durationMs: Date.now() - start }, 'project getBySlug');
        return result;
    }
    async create(data) {
        const start = Date.now();
        const exists = await Project_1.Project.findOne({ slug: data.slug }).lean();
        if (exists) {
            log.warn({ op: 'create', slug: data.slug }, 'project slug already exists');
            throw new Error('slug already exists');
        }
        const doc = await Project_1.Project.create(data);
        const result = doc.toObject();
        log.info({
            op: 'create',
            id: String(doc._id),
            slug: data.slug,
            durationMs: Date.now() - start,
        }, 'project created');
        return result;
    }
    async updateById(id, data) {
        const start = Date.now();
        const updated = await Project_1.Project.findByIdAndUpdate(id, data, {
            new: true,
        }).lean();
        log.info({ op: 'updateById', id, updated: Boolean(updated), durationMs: Date.now() - start }, 'project updated');
        return updated;
    }
    async deleteById(id) {
        const start = Date.now();
        await Project_1.Project.findByIdAndDelete(id);
        log.info({ op: 'deleteById', id, durationMs: Date.now() - start }, 'project deleted');
    }
}
exports.MongoProjectsRepo = MongoProjectsRepo;
//# sourceMappingURL=projectsRepo.js.map