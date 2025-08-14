/**
 * Google Cloud Storage V4 signed URL generation for direct browser uploads.
 * The server never proxies file bytes; it only issues a short-lived PUT URL.
 */
import { Storage } from '@google-cloud/storage';

const storage = new Storage();

/**
 * Create a V4 signed PUT URL for a specific object path and content type.
 */
export async function createV4UploadSignedUrl(params: {
  bucket: string;
  objectPath: string;
  contentType: string;
  expiresInSeconds?: number;
}) {
  const { bucket, objectPath, contentType, expiresInSeconds = 15 * 60 } = params;
  const options = {
    version: 'v4' as const, // Signature version
    action: 'write' as const, // Allow HTTP PUT
    expires: Date.now() + expiresInSeconds * 1000, // Absolute epoch ms expiration
    contentType, // Must match client's Content-Type header on PUT
  };
  const [url] = await storage.bucket(bucket).file(objectPath).getSignedUrl(options);
  return url;
}
