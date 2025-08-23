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

/**
 * List files in GCS bucket with optional filtering
 */
export async function listBucketFiles(params: {
  bucket: string;
  prefix?: string;
  maxResults?: number;
  delimiter?: string;
}) {
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
export async function createV4ViewSignedUrl(params: {
  bucket: string;
  objectPath: string;
  expiresInSeconds?: number;
}) {
  const { bucket, objectPath, expiresInSeconds = 60 * 60 } = params; // 1 hour default
  const options = {
    version: 'v4' as const,
    action: 'read' as const,
    expires: Date.now() + expiresInSeconds * 1000,
  };
  const [url] = await storage.bucket(bucket).file(objectPath).getSignedUrl(options);
  return url;
}
