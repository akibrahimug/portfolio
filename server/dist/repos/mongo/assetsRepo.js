"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoAssetsRepo = void 0;
const console_1 = require("../../logging/console");
const Asset_1 = require("../../models/Asset");
const log = (0, console_1.getTaggedLogger)('REPO:ASSETS');
class MongoAssetsRepo {
    async ensureIndexes() {
        const start = Date.now();
        await Asset_1.Asset.syncIndexes();
        log.info({ op: 'ensureIndexes', model: 'Asset', durationMs: Date.now() - start }, 'indexes ensured');
    }
    async create(data) {
        const start = Date.now();
        const doc = await Asset_1.Asset.create(data);
        const result = doc.toObject();
        log.info({
            op: 'create',
            model: 'Asset',
            projectId: data.projectId,
            ownerId: data.ownerId,
            path: data.path,
            size: data.size,
            contentType: data.contentType,
            durationMs: Date.now() - start,
        }, 'asset created');
        return result;
    }
}
exports.MongoAssetsRepo = MongoAssetsRepo;
//# sourceMappingURL=assetsRepo.js.map