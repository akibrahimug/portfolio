"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createV4UploadSignedUrl = createV4UploadSignedUrl;
exports.listBucketFiles = listBucketFiles;
exports.createV4ViewSignedUrl = createV4ViewSignedUrl;
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
/**
 * List files in GCS bucket with optional filtering
 */
async function listBucketFiles(params) {
    const { bucket, prefix = '', maxResults = 1000, delimiter } = params;
    const [files] = await storage.bucket(bucket).getFiles({
        prefix,
        maxResults,
        delimiter,
    });
    return files.map((file) => ({
        name: file.name,
        size: parseInt(String(file.metadata.size || '0')),
        contentType: file.metadata.contentType || 'application/octet-stream',
        timeCreated: file.metadata.timeCreated,
        updated: file.metadata.updated,
        publicUrl: `https://storage.googleapis.com/${bucket}/${file.name}`,
    }));
}
/**
 * Create a V4 signed GET URL for viewing/downloading a file
 */
async function createV4ViewSignedUrl(params) {
    const { bucket, objectPath, expiresInSeconds = 60 * 60 } = params; // 1 hour default
    const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresInSeconds * 1000,
    };
    const [url] = await storage.bucket(bucket).file(objectPath).getSignedUrl(options);
    return url;
}
//# sourceMappingURL=gcs.js.map