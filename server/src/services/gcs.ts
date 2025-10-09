/**
 * Google Cloud Storage V4 signed URL generation for direct browser uploads.
 * The server never proxies file bytes; it only issues a short-lived PUT URL.
 */
import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

// Initialize Google Cloud Storage with explicit credentials
const projectId = process.env.GCP_PROJECT_ID;
const isDevelopment = process.env.NODE_ENV !== 'production';

let storage: Storage;

try {
  // In production, use Application Default Credentials (no keyfile needed)
  // In development, use sa.json if GOOGLE_APPLICATION_CREDENTIALS is not set
  if (isDevelopment) {
    const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
                       path.join(process.cwd(), 'sa.json');

    // Check if credentials file exists and is not empty
    if (fs.existsSync(keyFilename)) {
      const stats = fs.statSync(keyFilename);
      if (stats.size === 0) {
        console.warn('[GCS] Warning: Service account file exists but is empty:', keyFilename);
        throw new Error('Empty service account file');
      }
    }

    storage = new Storage({
      projectId,
      keyFilename,
    });
  } else {
    // Production: use Application Default Credentials (ADC)
    // This works with GCP service accounts, workload identity, etc.
    storage = new Storage({
      projectId,
    });
  }
} catch (error) {
  console.warn('[GCS] Warning: Failed to initialize Google Cloud Storage:', error instanceof Error ? error.message : error);
  console.warn('[GCS] GCS operations will be disabled. Please check your service account credentials.');

  // Create a mock storage instance that throws helpful errors
  storage = new Proxy({} as Storage, {
    get() {
      throw new Error('Google Cloud Storage is not configured. Please set up valid service account credentials.');
    }
  });
}

export { storage };

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

export async function deleteObject(params: { bucket: string; objectPath: string }) {
  const { bucket, objectPath } = params;
  // Ignore "not found" so DB cleanup still succeeds if the file was already gone
  await storage.bucket(bucket).file(objectPath).delete({ ignoreNotFound: true });
}

export function toBucketAndKey(input: string, fallbackBucket?: string) {
  const clean = input.split('?')[0].split('#')[0];

  if (/^https?:\/\//i.test(clean)) {
    const u = new URL(clean);
    if (u.hostname === 'storage.googleapis.com') {
      const parts = u.pathname.replace(/^\/+/, '').split('/');
      const bucket = parts.shift() || '';
      return { bucket, key: parts.join('/') };
    }
    const m = u.hostname.match(/^(.+)\.storage\.googleapis\.com$/);
    if (m) return { bucket: m[1], key: u.pathname.replace(/^\/+/, '') };
    throw new Error('unsupported_gcs_url');
  }

  if (clean.startsWith('gs://')) {
    const rest = clean.slice(5);
    const [bucket, ...parts] = rest.split('/');
    return { bucket, key: parts.join('/') };
  }

  if (!fallbackBucket) throw new Error('missing_bucket');
  return { bucket: fallbackBucket, key: clean.replace(/^\/+/, '') };
}
