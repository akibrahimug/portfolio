"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoProjectsRepo = void 0;
const mongoose_1 = require("mongoose");
const Project_1 = require("../../models/Project");
class MongoProjectsRepo {
    async ensureIndexes() {
        await Project_1.Project.syncIndexes();
    }
    async list(params) {
        const { filter, limit, cursor } = params;
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
        const nextCursor = items.length === limit ? String(items[items.length - 1]._id) : undefined;
        return { items, nextCursor };
    }
    async getById(id) {
        return Project_1.Project.findById(id).lean();
    }
    async getBySlug(slug) {
        return Project_1.Project.findOne({ slug }).lean();
    }
    async create(data) {
        const exists = await Project_1.Project.findOne({ slug: data.slug }).lean();
        if (exists)
            throw new Error('slug already exists');
        const doc = await Project_1.Project.create(data);
        return doc.toObject();
    }
    async updateById(id, data) {
        return Project_1.Project.findByIdAndUpdate(id, data, { new: true }).lean();
    }
    async deleteById(id) {
        await Project_1.Project.findByIdAndDelete(id);
    }
}
exports.MongoProjectsRepo = MongoProjectsRepo;
//# sourceMappingURL=projectsRepo.js.map