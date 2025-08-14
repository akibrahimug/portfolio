"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createV4UploadSignedUrl = createV4UploadSignedUrl;
/**
 * Google Cloud Storage V4 signed URL generation for direct browser uploads.
 * The server never proxies file bytes; it only issues a short-lived PUT URL.
 */
const storage_1 = require("@google-cloud/storage");
const storage = new storage_1.Storage();
/**
 * Create a V4 signed PUT URL for a specific object path and content type.
 */
async function createV4UploadSignedUrl(params) {
    const { bucket, objectPath, contentType, expiresInSeconds = 15 * 60 } = params;
    const options = {
        version: 'v4', // Signature version
        action: 'write', // Allow HTTP PUT
        expires: Date.now() + expiresInSeconds * 1000, // Absolute epoch ms expiration
        contentType, // Must match client's Content-Type header on PUT
    };
    const [url] = await storage.bucket(bucket).file(objectPath).getSignedUrl(options);
    return url;
}
//# sourceMappingURL=gcs.js.map