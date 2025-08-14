"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = void 0;
/**
 * Asset model (Mongoose)
 * - References Project via `projectId`
 * - Stored object path in GCS under a namespaced prefix
 */
const mongoose_1 = require("mongoose");
const assetSchema = new mongoose_1.Schema({
    projectId: { type: mongoose_1.Types.ObjectId, ref: 'Project', index: true, required: true },
    ownerId: { type: String, required: true },
    path: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
exports.Asset = (0, mongoose_1.model)('Asset', assetSchema);
//# sourceMappingURL=Asset.js.map