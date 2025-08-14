"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoAssetsRepo = void 0;
const Asset_1 = require("../../models/Asset");
class MongoAssetsRepo {
    async ensureIndexes() {
        await Asset_1.Asset.syncIndexes();
    }
    async create(data) {
        const doc = await Asset_1.Asset.create(data);
        return doc.toObject();
    }
}
exports.MongoAssetsRepo = MongoAssetsRepo;
//# sourceMappingURL=assetsRepo.js.map