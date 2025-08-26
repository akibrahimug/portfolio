import { Router } from 'express';
import type { Request, Response } from 'express';
import config from '../config';
import { buildSchemas } from '../schemas';
import { authMiddleware } from '../services/auth';
import { createV4UploadSignedUrl, listBucketFiles, createV4ViewSignedUrl } from '../services/gcs';
import { Asset } from '../models/Asset';

const router = Router();
const schemas = buildSchemas();

/** ---------- Small type helpers (avoid `any`) ---------- */

type UnknownRecord = Record<string, unknown>;

function getString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function getNumber(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function getStringArray(v: unknown): string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string') ? (v as string[]) : [];
}

/** Minimal projection of config we actually use, read safely from unknown */
function readUploadsAllowedMime(cfg: unknown): string[] {
  const arr = (cfg as UnknownRecord)?.uploads as unknown;
  return getStringArray((arr as UnknownRecord | undefined)?.allowedMime);
}

function readUploadsMaxMb(cfg: unknown): number | undefined {
  const uploads = (cfg as UnknownRecord)?.uploads as unknown;
  return getNumber((uploads as UnknownRecord | undefined)?.maxMb);
}

function readGcsBucketUploads(cfg: unknown): string | undefined {
  const gcs = (cfg as UnknownRecord)?.gcs as unknown;
  return getString((gcs as UnknownRecord | undefined)?.bucketUploads);
}

function readGcsPublicBaseUrl(cfg: unknown): string | undefined {
  const gcs = (cfg as UnknownRecord)?.gcs as unknown;
  return getString((gcs as UnknownRecord | undefined)?.publicBaseUrl);
}

/** GCS listing minimal type we consume */
interface GcsListedFile {
  name: string;
  size?: number;
  updated?: Date | string;
}

/** Asset document shape we return (minimal) */
interface AssetDoc {
  _id: string;
  projectId: string;
  ownerId: string;
  path: string;
  contentType: string;
  size: number;
}

/** Zod-parsed request payloads (narrowed types) */
interface AssetsRequestUploadParsed {
  version: 'v1';
  projectId: string;
  filename: string;
  contentType?: string;
  size: number;
}

interface AssetsConfirmParsed {
  version: 'v1';
  projectId: string;
  ownerId: string;
  objectPath: string;
  contentType: string;
  size: number;
}

/** ---------- Bucket + MIME helpers ---------- */

function resolveUploadsBucket(): string | null {
  const fromConfig = readGcsBucketUploads(config);
  const fromEnv = process.env.GCS_BUCKET_UPLOADS;
  const bucket = fromConfig ?? fromEnv ?? null;
  if (!bucket) {
    // log once per boot in practice, but harmless here
    // eslint-disable-next-line no-console
    console.error(
      '[assets] No uploads bucket configured. Set config.gcs.bucketUploads or GCS_BUCKET_UPLOADS.',
    );
  }
  return bucket;
}

/** Robust MIME matcher: supports '*', 'image/*', or exact 'application/pdf'. */
function isAllowedMime(contentType: string, allowed: string[]): boolean {
  if (allowed.length === 0) return true; // allow all if not configured
  const ct = contentType.toLowerCase();
  if (!ct) return false;
  if (allowed.includes('*')) return true;

  for (const ruleRaw of allowed) {
    const rule = ruleRaw.trim().toLowerCase();
    if (!rule) continue;
    if (rule === ct) return true;
    if (rule.endsWith('/*')) {
      const prefix = rule.slice(0, -2);
      if (ct.startsWith(`${prefix}/`)) return true;
    }
  }
  return false;
}

/** Build effective allow-list from config or env with a safe default. */
function getAllowedMime(): string[] {
  const cfgList = readUploadsAllowedMime(config);
  const envList = (process.env.UPLOADS_ALLOWED_MIME || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // If neither provided, use a reasonable default set
  const defaultList = [
    // documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // images
    'image/*',
    // text
    'text/plain',
  ];

  const merged = Array.from(new Set<string>([...cfgList, ...envList]));
  return merged.length ? merged : defaultList;
}

/** Infer MIME from filename when file.type is missing/unreliable */
function inferMimeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
      return 'text/plain';
    case 'md':
      return 'text/markdown';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'csv':
      return 'text/csv';
    case 'json':
      return 'application/json';
    default:
      return 'application/octet-stream';
  }
}

/** Generates a safe object path under uploads/<projectId>/... */
function buildObjectPath(projectId: string, filename: string): string {
  const ts = Date.now();
  // no-useless-escape: use character class without escaping '-'
  const safeName = filename.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_');
  const pid = (projectId || 'misc').replace(/[^\w.-]+/g, '_');
  return `uploads/${pid}/${ts}-${safeName}`;
}

/** ---------- Routes ---------- */

// POST /assets/request-upload → returns signed URL (auth required)
router.post('/request-upload', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const bucket = resolveUploadsBucket();
    if (!bucket) return res.status(500).json({ error: 'bucket_not_configured' });

    const allowed = getAllowedMime();

    const parsed = schemas.AssetsRequestUploadReq.parse({
      version: 'v1',
      ...req.body,
    }) as AssetsRequestUploadParsed;

    const { projectId, filename } = parsed;
    let { contentType } = parsed;
    const { size } = parsed; // never reassigned → const

    // Infer contentType if missing/placeholder
    if (!contentType || contentType === 'application/octet-stream') {
      contentType = inferMimeFromName(filename);
    }

    const cfgMaxMb = readUploadsMaxMb(config);
    const maxMb = Number.isFinite(cfgMaxMb as number)
      ? (cfgMaxMb as number)
      : Number(process.env.MAX_UPLOAD_MB || 20);

    if (size / (1024 * 1024) > maxMb) {
      return res.status(413).json({ error: 'file_too_large', maxMb });
    }

    if (!isAllowedMime(contentType, allowed)) {
      return res
        .status(415)
        .json({ error: 'invalid_content_type', allowed, received: contentType });
    }

    const objectPath = buildObjectPath(projectId, filename);

    const uploadUrl = await createV4UploadSignedUrl({
      bucket,
      objectPath,
      contentType,
      expiresInSeconds: 15 * 60, // 15 minutes
    });

    return res.json({
      uploadUrl,
      objectPath,
      headers: { 'Content-Type': contentType },
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[assets] request-upload error', err);
    return res.status(400).json({ error: 'invalid_request' });
  }
});

// POST /assets/confirm → persist metadata after client PUT (auth required)
router.post('/confirm', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const parsed = schemas.AssetsConfirmReq.parse({
      version: 'v1',
      ...req.body,
      ownerId: userId,
    }) as AssetsConfirmParsed;

    const assetDoc = (await Asset.create({
      projectId: parsed.projectId,
      ownerId: parsed.ownerId,
      path: parsed.objectPath,
      contentType: parsed.contentType,
      size: parsed.size,
    })) as unknown as AssetDoc;

    return res.status(201).json({ asset: assetDoc });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[assets] confirm error', err);
    return res.status(400).json({ error: 'invalid_request' });
  }
});

// GET /assets/browse → list bucket contents (auth required)
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

    const files = (await listBucketFiles({
      bucket,
      prefix,
      maxResults,
    })) as unknown as GcsListedFile[];

    const publicBase = readGcsPublicBaseUrl(config);
    const publicBaseNormalized = publicBase ? publicBase.replace(/\/+$/, '') : undefined;
    // eslint-disable-next-line no-inner-declarations
    function formatUpdated(u: Date | string | undefined): string | null {
      if (!u) return null;
      return typeof u === 'string' ? u : u.toISOString();
    }

    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const viewUrl = await createV4ViewSignedUrl({
          bucket,
          objectPath: file.name,
          expiresInSeconds: 60 * 60, // 1 hour
        });
        return {
          name: file.name,
          size: file.size ?? 0,
          updated: formatUpdated(file.updated),
          signedUrl: viewUrl,
          publicUrl: publicBaseNormalized ? `${publicBaseNormalized}/${file.name}` : null,
        };
      }),
    );

    return res.json({
      items: filesWithUrls,
      total: files.length,
      hasMore: files.length === maxResults,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[assets] browse error', err);
    return res.status(500).json({ error: 'browse_failed' });
  }
});

// GET /assets/folders → list folder structure (auth required)
router.get('/folders', authMiddleware, async (req: Request, res: Response) => {
  try {
    const bucket = resolveUploadsBucket();
    if (!bucket) return res.status(500).json({ error: 'bucket_not_configured' });

    const prefix =
      typeof req.query.prefix === 'string' && req.query.prefix.trim()
        ? req.query.prefix.trim().replace(/^\/+/, '')
        : 'uploads/';

    const files = (await listBucketFiles({
      bucket,
      prefix,
      maxResults: 1000,
    })) as unknown as GcsListedFile[];

    const folders = [
      ...new Set(
        files
          .map((file) => file.name.split('/').slice(0, -1).join('/'))
          .filter((folder) => folder && folder !== prefix),
      ),
    ];

    return res.json({ folders });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error listing folders:', err);
    return res.status(500).json({ error: 'folders_failed' });
  }
});

export default router;
