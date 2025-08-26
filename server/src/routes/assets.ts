import { Router } from 'express';
import type { Request, Response } from 'express';
import config from '../config';
import { buildSchemas } from '../schemas';
import { authMiddleware } from '../services/auth';
import { createV4UploadSignedUrl, listBucketFiles, createV4ViewSignedUrl } from '../services/gcs';
import { Asset } from '../models/Asset';

const router = Router();
const schemas = buildSchemas();

function resolveUploadsBucket(): string | null {
  const fromConfig = (config as any)?.gcs?.bucketUploads as string | undefined;
  const fromEnv = process.env.GCS_BUCKET_UPLOADS;
  const bucket = fromConfig || fromEnv || null;
  if (!bucket) {
    console.error('[assets] No uploads bucket configured. Set config.gcs.bucketUploads or GCS_BUCKET_UPLOADS.');
  }
  return bucket;
}

function inferMimeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt': return 'text/plain';
    case 'md': return 'text/markdown';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'gif': return 'image/gif';
    case 'csv': return 'text/csv';
    case 'json': return 'application/json';
    default: return 'application/octet-stream';
  }
}

function isAllowedMime(contentType: string, allowed: string[]): boolean {
  if (!allowed || allowed.length === 0) return true; // allow all if not configured
  const ct = (contentType || '').toLowerCase();
  if (!ct) return false;
  if (allowed.includes('*')) return true;

  for (const rule of allowed) {
    const r = rule.trim().toLowerCase();
    if (!r) continue;
    if (r === ct) return true;
    if (r.endsWith('/*')) {
      const prefix = r.slice(0, -2);
      if (ct.startsWith(prefix + '/')) return true;
    }
  }
  return false;
}

function getAllowedMime(): string[] {
  const cfgList: string[] = Array.isArray((config as any)?.uploads?.allowedMime)
    ? ((config as any).uploads.allowedMime as string[])
    : [];
  const envList = (process.env.UPLOADS_ALLOWED_MIME || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const defaultList = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/*',
    'text/plain',
  ];
  const merged = [...new Set([...(cfgList || []), ...envList])];
  return merged.length ? merged : defaultList;
}

function buildObjectPath(projectId: string, filename: string): string {
  const ts = Date.now();
  const safeName = filename.replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_');
  const pid = (projectId || 'misc').replace(/[^\w.\-]+/g, '_');
  return `uploads/${pid}/${ts}-${safeName}`;
}

// POST /assets/request-upload
router.post('/request-upload', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const bucket = resolveUploadsBucket();
    if (!bucket) return res.status(500).json({ error: 'bucket_not_configured' });

    const allowed = getAllowedMime();
    const parsed = schemas.AssetsRequestUploadReq.parse({ version: 'v1', ...req.body });
    const { projectId, filename } = parsed;
    let { contentType, size } = parsed;

    // Infer contentType if missing/empty
    if (!contentType || contentType === 'application/octet-stream') {
      contentType = inferMimeFromName(filename);
    }

    const maxMb =
      Number.isFinite((config as any)?.uploads?.maxMb) && (config as any).uploads.maxMb > 0
        ? (config as any).uploads.maxMb
        : Number(process.env.MAX_UPLOAD_MB || 20);

    if (size / (1024 * 1024) > maxMb) {
      return res.status(413).json({ error: 'file_too_large', maxMb });
    }

    if (!isAllowedMime(contentType, allowed)) {
      return res.status(415).json({ error: 'invalid_content_type', allowed, received: contentType });
    }

    const objectPath = buildObjectPath(projectId, filename);

    const uploadUrl = await createV4UploadSignedUrl({
      bucket,
      objectPath,
      contentType,
      expiresInSeconds: 15 * 60,
    });

    return res.json({
      uploadUrl,
      objectPath,
      headers: { 'Content-Type': contentType },
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    console.error('[assets] request-upload error', err);
    return res.status(400).json({ error: 'invalid_request' });
  }
});

// POST /assets/confirm
router.post('/confirm', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const parsed = schemas.AssetsConfirmReq.parse({ version: 'v1', ...req.body, ownerId: userId });

    const asset = await Asset.create({
      projectId: parsed.projectId,
      ownerId: parsed.ownerId,
      path: parsed.objectPath,
      contentType: parsed.contentType,
      size: parsed.size,
    });

    return res.status(201).json({ asset });
  } catch (err) {
    console.error('[assets] confirm error', err);
    return res.status(400).json({ error: 'invalid_request' });
  }
});

// GET /assets/browse
router.get('/browse', authMiddleware, async (req: Request, res: Response) => {
  try {
    const bucket = resolveUploadsBucket();
    if (!bucket) return res.status(500).json({ error: 'bucket_not_configured' });

    const prefix =
      typeof req.query.prefix === 'string' && req.query.prefix.trim()
        ? req.query.prefix.trim().replace(/^\/+/, '')
        : '';
    const maxResults =
      typeof req.query.limit === 'string' && !Number.isNaN(Number(req.query.limit))
        ? Math.max(1, Math.min(1000, Number(req.query.limit)))
        : 200;

    const files = await listBucketFiles({ bucket, prefix, maxResults });
    const publicBase = (config as any)?.gcs?.publicBaseUrl || '';

    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const viewUrl = await createV4ViewSignedUrl({
          bucket,
          objectPath: file.name,
          expiresInSeconds: 60 * 60,
        });
        return {
          name: file.name,
          size: file.size ?? 0,
          updated: file.updated?.toISOString?.() ?? null,
          signedUrl: viewUrl,
          publicUrl: publicBase ? `${publicBase.replace(/\/+$/, '')}/${file.name}` : null,
        };
      }),
    );

    return res.json({ items: filesWithUrls, total: files.length, hasMore: files.length === maxResults });
  } catch (err) {
    console.error('[assets] browse error', err);
    return res.status(500).json({ error: 'browse_failed' });
  }
});

// GET /assets/folders
router.get('/folders', authMiddleware, async (req: Request, res: Response) => {
  try {
    const bucket = resolveUploadsBucket();
    if (!bucket) return res.status(500).json({ error: 'bucket_not_configured' });

    const prefix =
      typeof req.query.prefix === 'string' && req.query.prefix.trim()
        ? req.query.prefix.trim().replace(/^\/+/, '')
        : 'uploads/';

    const files = await listBucketFiles({ bucket, prefix, maxResults: 1000 });

    const folders = [
      ...new Set(
        files
          .map((file) => file.name.split('/').slice(0, -1).join('/'))
          .filter((folder) => folder && folder !== prefix),
      ),
    ];

    return res.json({ folders });
  } catch (err) {
    console.error('Error listing folders:', err);
    return res.status(500).json({ error: 'folders_failed' });
  }
});

export default router;
