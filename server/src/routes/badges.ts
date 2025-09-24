import { Router } from 'express';
import { authMiddleware } from '../services/auth';
import { storage } from '../services/gcs';
import type { Request, Response } from 'express';

const router = Router();

// GET /badges — list all badge images (requires auth)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    console.log('[BADGES] Request received - userId:', userId);

    if (!process.env.GCS_BUCKET_UPLOADS) {
      console.log('[BADGES] Error: GCS bucket not configured');
      res.status(500).json({ success: false, error: 'GCS bucket not configured' });
      return;
    }

    if (!userId) {
      console.log('[BADGES] Error: User not authenticated');
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const bucketName = process.env.GCS_BUCKET_UPLOADS;
    const prefix = `badge/${userId}/`;
    console.log('[BADGES] Searching with prefix:', prefix, 'in bucket:', bucketName);

    // Pagination support
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200); // Max 200

    console.log('[BADGES] Pagination - page:', page, 'limit:', limit);

    // Get ALL files first (we need to know total count for proper pagination)
    const [files] = await storage.bucket(bucketName).getFiles({
      prefix,
    });

    console.log('[BADGES] Found', files.length, 'total files with prefix:', prefix);

    const badges = files
      .filter(file => {
        const contentType = file.metadata.contentType as string || '';
        return contentType.startsWith('image/');
      })
      .map(file => {
        const meta = file.metadata as {
          contentType?: string;
          size?: string | number;
          timeCreated?: string;
          updated?: string;
        };
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${file.name}`;

        return {
          _id: file.name.replace(/[^a-zA-Z0-9]/g, '_'),
          name: file.name.split('/').pop()?.replace(/^\d+-/, '') || file.name,
          size: parseInt(String(meta?.size ?? '0')),
          contentType: meta?.contentType || 'image/png',
          timeCreated: String(meta?.timeCreated ?? ''),
          updated: String(meta?.updated ?? ''),
          objectPath: file.name,
          publicUrl,
          viewUrl: publicUrl,
        };
      });

    console.log('[BADGES] Filtered to', badges.length, 'image files');

    // Sort by timeCreated (newest first)
    badges.sort((a, b) => new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime());

    // Implement pagination on the filtered results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBadges = badges.slice(startIndex, endIndex);
    const hasMore = endIndex < badges.length;

    console.log('[BADGES] Returning', paginatedBadges.length, 'badges (', startIndex, '-', endIndex, 'of', badges.length, ')');

    const responseData = {
      success: true,
      data: {
        badges: paginatedBadges,
        total: badges.length,
        page,
        limit,
        hasMore,
        totalPages: Math.ceil(badges.length / limit),
      },
    };

    res.json(responseData);
    return;
  } catch (error) {
    console.error('Browse badges failed:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to browse badges',
      data: { badges: [], total: 0 },
    });
    return;
  }
});

// DELETE /badges/:filename — delete badge by filename
router.delete('/:filename', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    const { filename } = req.params;

    if (!process.env.GCS_BUCKET_UPLOADS) {
      res.status(500).json({ success: false, error: 'GCS bucket not configured' });
      return;
    }

    // Construct the full object path
    const objectPath = `badge/${userId}/${filename}`;

    const bucket = storage.bucket(process.env.GCS_BUCKET_UPLOADS);
    const file = bucket.file(objectPath);

    // Check if file exists and belongs to user
    const [exists] = await file.exists();
    if (!exists) {
      res.status(404).json({
        success: false,
        error: 'Badge not found',
      });
      return;
    }

    // Delete the file
    await file.delete();

    res.json({
      success: true,
      data: { ok: true },
    });
    return;
  } catch (error) {
    console.error('Delete badge failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete badge',
    });
    return;
  }
});

export default router;