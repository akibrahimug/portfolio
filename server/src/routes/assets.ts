import { Router } from 'express';
import type { Request, Response } from 'express';
import config from '../config';
import { buildSchemas } from '../schemas';
import { authMiddleware } from '../services/auth';
import { createV4UploadSignedUrl, listBucketFiles, createV4ViewSignedUrl } from '../services/gcs';
import { Asset } from '../models/Asset';

const router = Router();
const schemas = buildSchemas();

// POST /assets/request-upload → returns signed URL (auth required)
router.post('/request-upload', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const parsed = schemas.AssetsRequestUploadReq.parse({ version: 'v1', ...req.body });
    const bucket = config.gcs.bucketUploads;
    if (!bucket) return res.status(500).json({ error: 'bucket_not_configured' });

    if (parsed.size / (1024 * 1024) > config.uploads.maxMb)
      return res.status(413).json({ error: 'file_too_large' });
    if (
      config.uploads.allowedMime.length &&
      !config.uploads.allowedMime.includes(parsed.contentType)
    )
      return res.status(415).json({ error: 'invalid_content_type' });

    const objectPath = `uploads/${parsed.projectId}/${Date.now()}-${parsed.filename}`;
    const uploadUrl = await createV4UploadSignedUrl({
      bucket,
      objectPath,
      contentType: parsed.contentType,
      expiresInSeconds: 15 * 60,
    });
    return res.json({
      uploadUrl,
      objectPath,
      headers: { 'Content-Type': parsed.contentType },
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    return res.status(400).json({ error: 'invalid_request' });
  }
});

// POST /assets/confirm → persist metadata after client PUT (auth required)
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
    return res.status(400).json({ error: 'invalid_request' });
  }
});

// GET /assets/browse → list bucket contents (auth required)
router.get('/browse', authMiddleware, async (req: Request, res: Response) => {
  try {
    const bucket = config.gcs.bucketUploads;
    if (!bucket) return res.status(500).json({ error: 'bucket_not_configured' });

    const { prefix = '', limit = '100', type = '' } = req.query;
    const maxResults = Math.min(parseInt(limit as string) || 100, 1000);

    const files = await listBucketFiles({
      bucket,
      prefix: prefix as string,
      maxResults,
    });

    // Filter by content type if specified (e.g., 'image' for images only)
    const filteredFiles = type
      ? files.filter((file) => file.contentType.startsWith(type as string))
      : files;

    // Generate signed URLs for viewing
    const filesWithUrls = await Promise.all(
      filteredFiles.map(async (file) => ({
        ...file,
        viewUrl: await createV4ViewSignedUrl({
          bucket,
          objectPath: file.name,
          expiresInSeconds: 60 * 60, // 1 hour
        }),
      })),
    );

    return res.json({
      files: filesWithUrls,
      total: filteredFiles.length,
      hasMore: filteredFiles.length === maxResults,
    });
  } catch (err) {
    console.error('Error browsing assets:', err);
    return res.status(500).json({ error: 'browse_failed' });
  }
});

// GET /assets/folders → list folder structure (auth required)
router.get('/folders', authMiddleware, async (req: Request, res: Response) => {
  try {
    const bucket = config.gcs.bucketUploads;
    if (!bucket) return res.status(500).json({ error: 'bucket_not_configured' });

    const { prefix = '' } = req.query;

    const files = await listBucketFiles({
      bucket,
      prefix: prefix as string,
      delimiter: '/', // This gives us folder-like structure
    });

    // Extract unique folder paths
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
