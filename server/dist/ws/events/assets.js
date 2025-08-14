"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAssetEvents = registerAssetEvents;
const config_1 = __importDefault(require("../../config"));
const gcs_1 = require("../../services/gcs");
const Asset_1 = require("../../models/Asset");
const types_1 = require("../types");
const authz_1 = require("../authz");
function registerAssetEvents(schemas) {
    return {
        async requestUpload(socket, payload, ctx) {
            // Must be authenticated to upload
            const userId = (0, authz_1.requireAuth)(ctx);
            const req = schemas.AssetsRequestUploadReq.parse(payload);
            // Ensure bucket configured
            const bucket = config_1.default.gcs.bucketUploads;
            if (!bucket)
                return (0, types_1.send)(socket, 'system:error', { message: 'GCS bucket not configured' });
            // Build namespaced object path under project prefix
            const objectPath = `uploads/${req.projectId}/${Date.now()}-${req.filename}`;
            // Enforce size and MIME policy from config
            if (req.size / (1024 * 1024) > config_1.default.uploads.maxMb) {
                return (0, types_1.send)(socket, 'system:error', { message: 'file too large' });
            }
            if (config_1.default.uploads.allowedMime.length &&
                !config_1.default.uploads.allowedMime.includes(req.contentType)) {
                return (0, types_1.send)(socket, 'system:error', { message: 'invalid content type' });
            }
            // Issue short-lived V4 signed PUT URL
            const uploadUrl = await (0, gcs_1.createV4UploadSignedUrl)({
                bucket,
                objectPath,
                contentType: req.contentType,
                expiresInSeconds: 15 * 60,
            });
            // Client must use these exact headers on PUT
            return (0, types_1.send)(socket, 'assets:requestUpload', {
                uploadUrl,
                objectPath,
                headers: { 'Content-Type': req.contentType },
                expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            });
        },
        async confirm(socket, payload, ctx) {
            // Must be authenticated to confirm
            const userId = (0, authz_1.requireAuth)(ctx);
            const req = schemas.AssetsConfirmReq.parse(payload);
            // Persist asset metadata (assumes client successfully uploaded)
            const asset = await Asset_1.Asset.create({
                projectId: req.projectId,
                ownerId: req.ownerId || userId,
                path: req.objectPath,
                contentType: req.contentType,
                size: req.size,
            });
            return (0, types_1.send)(socket, 'assets:confirm', { asset });
        },
    };
}
//# sourceMappingURL=assets.js.map