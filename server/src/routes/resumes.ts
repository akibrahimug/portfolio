import { Router } from 'express';
import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Asset } from '../models/Asset';
import { createV4ViewSignedUrl, deleteObject, toBucketAndKey } from '../services/gcs';
import { authMiddleware } from '../services/auth';
import config from '../config'; 
const router = Router();

const BUCKET = process.env.GCS_BUCKET_UPLOADS!; // set this in your server env

// Helper function to resolve the uploads bucket
function resolveUploadsBucket(): string | null {
  const fromConfig = config.gcs.bucketUploads;
  if (!fromConfig) {
    console.error('[resumes] No uploads bucket configured.');
  }
  return fromConfig || null;
}

/**
 * PATCH /api/v1/resumes/:id
 * Persist/toggle `isPublic` for a resume (stored as Asset with assetType='resume').
 * - Body optional: { isPublic: boolean }
 *   - If omitted, value is toggled.
 * - Only touches Mongo; does NOT touch GCS.
 * - Optional single-public behavior via RESUME_SINGLE_PUBLIC=true
 */
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as unknown as { userId?: string }).userId;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'invalid_id' });
    }

    // Find resume owned by the current user
    const resume = await Asset.findOne({
      _id: id,
      ownerId: userId,
      assetType: 'resume',
    });

    if (!resume) {
      return res.status(404).json({ error: 'not_found' });
    }

    // Determine next value
    let nextIsPublic: boolean;
    if (typeof req.body?.isPublic === 'boolean') {
      nextIsPublic = !!req.body.isPublic;
    } else {
      // No body provided -> toggle current
      nextIsPublic = !resume.isPublic;
    }

    // Optional: ensure only one public resume at a time
    // Enable by setting RESUME_SINGLE_PUBLIC=true
    const enforceSingle = String(process.env.RESUME_SINGLE_PUBLIC || '').toLowerCase() === 'true';

    if (enforceSingle && nextIsPublic === true) {
      await Asset.updateMany(
        { ownerId: userId, assetType: 'resume', _id: { $ne: resume._id } },
        { $set: { isPublic: false } },
      );
    }

    resume.isPublic = nextIsPublic;
    await resume.save();

    // Respond in the shape your client expects
    return res.json({ resume });
  } catch (err) {
    console.error('PATCH /resumes/:id failed:', err);
    return res.status(500).json({ error: '[[RESUMES_PATCH]]-[SERVER]: internal_error' });
  }
});

// List resumes (public access)
router.get('/resumes', async (req, res) => {
  const items = await Asset.find({ assetType: 'resume' }).sort({ createdAt: -1 });
  res.json({ items }); // includes isPublic
});

// GET /resumes - Get all resume assets
router.get('/', async (req: Request, res: Response) => {
  try {
    // Find all assets with assetType = 'resume'
    const resumeAssets = await Asset.find({ assetType: 'resume' }).sort({ createdAt: -1 }).lean();

    const bucket = resolveUploadsBucket();
    if (!bucket) {
      return res.json({
        items: resumeAssets.map((asset) => ({
          ...asset,
          signedUrl: null,
          error: '[[RESUMES_LIST]]-[SERVER]: bucket_not_configured',
        })),
      });
    }

    // Add signed URLs to each resume
    const items = await Promise.all(
      resumeAssets.map(async (asset) => {
        try {
          const signedUrl = await createV4ViewSignedUrl({
            bucket,
            objectPath: asset.path,
            expiresInSeconds: 60 * 60, // 1 hour
          });

          return {
            ...asset,
            signedUrl,
          };
        } catch (error) {
          console.error('[[RESUMES_LIST]]-[SERVER]: Error generating signed URL:', error);
          return {
            ...asset,
            signedUrl: null,
            error: '[[RESUMES_LIST]]-[SERVER]: signed_url_generation_failed',
          };
        }
      }),
    );

    return res.json({ items });
  } catch (error) {
    console.error('[[RESUMES_LIST]]-[SERVER]: Error fetching resumes:', error);
    return res.status(500).json({ error: '[[RESUMES_LIST]]-[SERVER]: failed_to_fetch_resumes' });
  }
});

// GET /resumes/latest - Get only the most recent resume
router.get('/latest', async (req: Request, res: Response) => {
  try {
    // Find the most recent resume asset
    const latestResume = await Asset.findOne({ assetType: 'resume' })
      .sort({ createdAt: -1 })
      .lean();

    if (!latestResume) {
      return res.status(404).json({ error: '[[RESUMES_LATEST]]-[SERVER]: no_resumes_found' });
    }

    const bucket = resolveUploadsBucket();
    if (!bucket) {
      return res.json({
        resume: {
          ...latestResume,
          signedUrl: null,
          error: '[[RESUMES_LATEST]]-[SERVER]: bucket_not_configured',
        },
      });
    }

    try {
      const signedUrl = await createV4ViewSignedUrl({
        bucket,
        objectPath: latestResume.path,
        expiresInSeconds: 60 * 60, // 1 hour
      });

      return res.json({
        resume: {
          ...latestResume,
          signedUrl,
        },
      });
    } catch (error) {
      console.error('[[RESUMES_LATEST]]-[SERVER]: Error generating signed URL:', error);
      return res.json({
        resume: {
          ...latestResume,
          signedUrl: null,
          error: '[[RESUMES_LATEST]]-[SERVER]: signed_url_generation_failed',
        },
      });
    }
  } catch (error) {
    console.error('[[RESUMES_LATEST]]-[SERVER]: Error fetching latest resume:', error);
    return res
      .status(500)
      .json({ error: '[[RESUMES_LATEST]]-[SERVER]: failed_to_fetch_latest_resume' });
  }
});

// GET /resumes/public - Get the most recent public resume
router.get('/public', async (req: Request, res: Response) => {
  try {
    // Find the most recent public resume
    const publicResume = await Asset.findOne({ assetType: 'resume', isPublic: true })
      .sort({ createdAt: -1 })
      .lean();

    if (!publicResume) {
      return res.status(404).json({ error: '[[RESUMES_PUBLIC]]-[SERVER]: no_public_resume_found' });
    }

    const bucket = resolveUploadsBucket();
    if (!bucket) {
      return res.json({
        resume: {
          ...publicResume,
          signedUrl: null,
          error: '[[RESUMES_PUBLIC]]-[SERVER]: bucket_not_configured',
        },
      });
    }

    try {
      const signedUrl = await createV4ViewSignedUrl({
        bucket,
        objectPath: publicResume.path,
        expiresInSeconds: 60 * 60, // 1 hour
      });

      return res.json({
        resume: {
          ...publicResume,
          signedUrl,
        },
      });
    } catch (error) {
      console.error('[[RESUMES_PUBLIC]]-[SERVER]: Error generating signed URL:', error);
      return res.json({
        resume: {
          ...publicResume,
          signedUrl: null,
          error: '[[RESUMES_PUBLIC]]-[SERVER]: signed_url_generation_failed',
        },
      });
    }
  } catch (error) {
    console.error('[[RESUMES_PUBLIC]]-[SERVER]: Error fetching public resume:', error);
    return res
      .status(500)
      .json({ error: '[[RESUMES_PUBLIC]]-[SERVER]: failed_to_fetch_public_resume' });
  }
});

// DELETE /resumes/:id - Delete a specific resume (requires auth)

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId)
      return res.status(401).json({ error: '[[RESUMES_DELETE]]-[SERVER]: unauthorized' });

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: '[[RESUMES_DELETE]]-[SERVER]: invalid_id' });
    }

    const resume = await Asset.findById(id);
    if (!resume)
      return res.status(404).json({ error: '[[RESUMES_DELETE]]-[SERVER]: resume_not_found' });
    if (resume.ownerId !== userId) {
      return res.status(403).json({ error: '[[RESUMES_DELETE]]-[SERVER]: forbidden' });
    }

    // Delete object from GCS (supports objectPath OR path; handles plain key / gs:// / https)
    const rawPath =
      (resume as unknown as { objectPath?: string; path?: string }).objectPath ??
      (resume as unknown as { path?: string }).path;
    if (rawPath) {
      try {
        // If you *only* store plain keys, you can call deleteObject({ bucket: BUCKET, objectPath: rawPath })
        const { bucket, key } = toBucketAndKey(String(rawPath), BUCKET);
        await deleteObject({ bucket, objectPath: key });
      } catch (e) {
        console.error(
          '[[RESUMES_DELETE]]-[SERVER]: GCS delete failed:',
          (e as unknown as { message?: string })?.message || e,
        );
        // continue – DB will still be cleaned up; ignoreNotFound is already handled above
      }
    }

    // Delete DB doc
    await Asset.findByIdAndDelete(id);

    return res.json({ success: true });
  } catch (error) {
    console.error('[[RESUMES_DELETE]]-[SERVER]: Error deleting resume:', error);
    return res.status(500).json({ error: '[[RESUMES_DELETE]]-[SERVER]: failed_to_delete_resume' });
  }
});

export default router;
