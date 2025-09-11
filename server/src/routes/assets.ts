import { Router } from 'express';
import { Types } from 'mongoose';
import { MongoAssetsRepo } from '../repos/mongo/assetsRepo';
import { buildSchemas } from '../schemas';
import { authMiddleware } from '../services/auth';
import { storage } from '../services/gcs';
import type { Request, Response } from 'express';

const router = Router();
const schemas = buildSchemas();
const assetsRepo = new MongoAssetsRepo();

// POST /assets/request-upload � get signed URL for direct upload
router.post('/request-upload', authMiddleware, async (req: Request, res: Response) => {
  try {
    console.log('=== UPLOAD REQUEST ===');
    console.log('Request body:', req.body);
    
    const parsed = schemas.AssetsRequestUploadReq.parse({ version: 'v1', ...req.body });
    const { filename, contentType, folder, assetType } = parsed;
    const userId = (req as unknown as { userId?: string }).userId || 'anonymous';

    console.log('Parsed request:', { filename, contentType, folder, assetType, userId });

    if (!process.env.GCS_BUCKET_UPLOADS) {
      console.error('GCS bucket not configured');
      return res.status(500).json({
        success: false,
        error: 'GCS bucket not configured',
      });
    }

    const bucket = storage.bucket(process.env.GCS_BUCKET_UPLOADS);

    // Build proper folder structure: assetType/userId/timestamp-filename
    // This ensures each assetType has its own top-level folder
    const assetTypeFolder = assetType || 'misc';
    const subFolder = folder ? `/${folder}` : '';
    const objectPath = `${assetTypeFolder}${subFolder}/${userId}/${Date.now()}-${filename}`;
    const file = bucket.file(objectPath);

    console.log('Generating signed URL for:', { bucket: process.env.GCS_BUCKET_UPLOADS, objectPath, contentType });
    
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    });

    console.log('Signed URL generated successfully');
    console.log('Upload URL length:', signedUrl.length);

    res.json({
      success: true,
      data: {
        uploadUrl: signedUrl,
        objectPath,
        headers: {
          'Content-Type': contentType,
        },
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
    });
    return;
  } catch (error) {
    console.error('Asset upload request failed:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Invalid request',
    });
    return;
  }
});

// POST /assets/confirm confirm upload and create asset record
router.post('/confirm', authMiddleware, async (req: Request, res: Response) => {
  try {
    console.log('=== CONFIRM UPLOAD ===');
    console.log('Request body:', req.body);
    
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId) {
      console.error('Unauthorized confirm request');
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const parsed = schemas.AssetsConfirmReq.parse({ version: 'v1', ownerId: userId, ...req.body });
    const { objectPath, contentType, size, projectId, assetType } = parsed;

    console.log('Confirming upload:', { objectPath, contentType, size, projectId, assetType, userId });

    const asset = await assetsRepo.createAsset({
      ownerId: userId,
      projectId,
      path: objectPath,
      contentType,
      size,
      assetType: assetType || 'project', // Use 'project' as fallback since 'other' is not in enum
    });

    const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_UPLOADS}/${objectPath}`;

    console.log('Asset created successfully:', asset._id);
    console.log('Public URL:', publicUrl);

    res.json({
      success: true,
      data: {
        asset,
        publicUrl,
        viewUrl: publicUrl,
        assetId: asset._id.toString(),
      },
    });
    return;
  } catch (error) {
    console.error('Asset confirm failed:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Invalid request',
    });
    return;
  }
});

// GET /assets/browse — list files in uploads bucket (auth required)
router.get('/browse', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!process.env.GCS_BUCKET_UPLOADS) {
      res.status(500).json({ success: false, error: 'GCS bucket not configured' });
      return;
    }

    const { prefix = '', limit = 100, type } = schemas.AssetsBrowseQuery.parse(req.query);
    const bucketName = process.env.GCS_BUCKET_UPLOADS;

    const [files] = await storage.bucket(bucketName as string).getFiles({
      prefix,
      maxResults: limit,
    });

    const mapped = files.map((file) => {
      const meta = file.metadata as unknown as {
        contentType?: string;
        size?: string | number;
        timeCreated?: string;
        updated?: string;
      };
      const contentType = (meta?.contentType as string) || 'application/octet-stream';
      const size = parseInt(String(meta?.size ?? '0'));
      const timeCreated = String(meta?.timeCreated ?? '');
      const updated = String(meta?.updated ?? '');
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${file.name}`;
      const viewUrl = publicUrl;
      return { name: file.name, size, contentType, timeCreated, updated, publicUrl, viewUrl };
    });

    const filtered =
      type === 'image' ? mapped.filter((f) => f.contentType.startsWith('image/')) : mapped;

    res.json({ success: true, data: { files: filtered, total: filtered.length, hasMore: false } });
    return;
  } catch (error) {
    console.error('Browse assets failed:', error);
    res
      .status(400)
      .json({
        success: false,
        error: 'Invalid request',
        data: { files: [], total: 0, hasMore: false },
      });
    return;
  }
});

// GET /assets/folders — list folder prefixes (auth required)
router.get('/folders', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!process.env.GCS_BUCKET_UPLOADS) {
      res.status(500).json({ success: false, error: 'GCS bucket not configured' });
      return;
    }

    const { prefix = '' } = schemas.AssetsFoldersQuery.parse(req.query);
    const bucketName = process.env.GCS_BUCKET_UPLOADS;
    const normalizedPrefix = prefix ? `${String(prefix).replace(/\/+$/, '')}/` : '';

    // The GCS client returns [files, nextQuery, apiResponse]; we only need apiResponse.prefixes
    const result = (await storage
      .bucket(bucketName as string)
      .getFiles({ prefix: normalizedPrefix, delimiter: '/' })) as unknown as [
      unknown[],
      unknown,
      { prefixes?: string[] },
    ];
    const apiResponse = result[2] || { prefixes: [] };
    const rawPrefixes = Array.isArray(apiResponse.prefixes) ? apiResponse.prefixes : [];
    const folders = rawPrefixes.map((p) => p.replace(/\/$/, ''));

    res.json({ success: true, data: { folders: folders || [] } });
    return;
  } catch (error) {
    console.error('List asset folders failed:', error);
    res.status(400).json({ success: false, error: 'Invalid request', data: { folders: [] } });
    return;
  }
});

// GET /assets/:id get asset by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid id' });
      return;
    }
    const asset = await assetsRepo.getAssetById(id);
    if (!asset) {
      res.status(404).json({
        success: false,
        error: 'Asset not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { asset },
    });
    return;
  } catch (error) {
    console.error('Get asset failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
    return;
  }
});

// DELETE /assets/:id delete asset
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    const asset = await assetsRepo.getAssetById(req.params.id as string);

    if (!asset) {
      res.status(404).json({
        success: false,
        error: 'Asset not found',
      });
      return;
    }

    if (asset.ownerId !== userId) {
      res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    // Delete from GCS first
    try {
      if (process.env.GCS_BUCKET_UPLOADS && asset.path) {
        const bucket = storage.bucket(process.env.GCS_BUCKET_UPLOADS);
        const file = bucket.file(asset.path);
        await file.delete();
      }
    } catch (gcsError) {
      console.warn('Failed to delete file from GCS:', gcsError);
      // Continue with database deletion even if GCS deletion fails
    }

    // Delete from database
    await assetsRepo.deleteAssetById(req.params.id);

    res.json({
      success: true,
      data: { ok: true },
    });
    return;
  } catch (error) {
    console.error('Delete asset failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
    return;
  }
});

export default router;
