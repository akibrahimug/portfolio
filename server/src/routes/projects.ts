import { Router } from 'express';
import { Project } from '../models/Project';
import { Technology } from '../models/Technology';
import { buildSchemas } from '../schemas';
import { authMiddleware } from '../services/auth';
import { MongoAssetsRepo } from '../repos/mongo/assetsRepo';
import { storage } from '../services/gcs';
import type { Request, Response } from 'express';

const router = Router();
const schemas = buildSchemas();
const assetsRepo = new MongoAssetsRepo();

// Helper function to extract GCS path from URL
function extractGcsPathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Extract path from URLs like: https://storage.googleapis.com/bucket-name/path/to/file
  const match = url.match(/https:\/\/storage\.googleapis\.com\/[^\/]+\/(.+)$/);
  return match ? match[1] : null;
}

// Helper function to clean up old hero image
async function cleanupOldHeroImage(oldImageUrl: string | null | undefined, projectId: string) {
  if (!oldImageUrl) return;

  const gcsPath = extractGcsPathFromUrl(oldImageUrl);
  if (!gcsPath) return;

  try {
    // Delete from GCS
    if (process.env.GCS_BUCKET_UPLOADS) {
      const bucket = storage.bucket(process.env.GCS_BUCKET_UPLOADS);
      const file = bucket.file(gcsPath);
      await file.delete();
      console.log(`Deleted old hero image from GCS: ${gcsPath}`);
    }

    // Find and delete associated asset records from database
    const matchingAssets = await assetsRepo.findAssetsByPath(gcsPath, projectId);

    for (const asset of matchingAssets) {
      await assetsRepo.deleteAssetById(asset._id.toString());
      console.log(`Deleted asset record from database: ${asset._id}`);
    }
  } catch (error) {
    console.warn(`Failed to cleanup old hero image: ${error}`);
    // Don't throw - we don't want cleanup failures to prevent the update
  }
}

// GET /projects → list with filters and cursor paging
router.get('/', async (req: Request, res: Response) => {
  try {
    const parsed = schemas.ProjectsListReq.parse({
      version: 'v1',
      filter: {
        kind: typeof req.query.kind === 'string' ? req.query.kind : undefined,
        category: typeof req.query.category === 'string' ? req.query.category : undefined,
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
      },
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      cursor: typeof req.query.cursor === 'string' ? req.query.cursor : undefined,
    });

    const filter: Record<string, unknown> = {};
    if (parsed.filter?.category) filter.category = parsed.filter.category;
    if (parsed.filter?.kind) filter.kind = parsed.filter.kind;
    if (parsed.filter?.search)
      filter.title = { $regex: parsed.filter.search, $options: 'i' } as {
        $regex: string;
        $options: string;
      };

    const limit = parsed.limit ?? 20;
    const cursorFilter = parsed.cursor ? { _id: { $gt: parsed.cursor } } : {};
    const items = await Project.find({ ...filter, ...cursorFilter })
      .limit(limit)
      .lean();
    const last = items[items.length - 1] as { _id?: unknown } | undefined;
    const nextCursor =
      items.length === limit && last && last._id ? String(last._id as string) : undefined;
    return res.json({ items, nextCursor });
  } catch (err) {
    return res.status(400).json({ error: '[[PROJECTS_LIST]]-[SERVER]: invalid_request' + err });
  }
});

// GET /projects/:idOrSlug → fetch single
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const project = await Project.findById(id).lean();
    return res.json({ project: project ?? null });
  } catch {
    return res.status(404).json({ project: null });
  }
});

// POST /projects → create (auth required)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId)
      return res.status(401).json({ error: '[[PROJECTS_CREATE]]-[SERVER]: unauthorized' });
    const parsed = schemas.ProjectsCreateReq.parse({
      version: req.body.version || 'v1',
      data: { ...(req.body.data || req.body), ownerId: userId },
    });
    // Normalize legacy githubUrl -> repoUrl if provided
    if (
      (parsed.data as unknown as { githubUrl?: string; repoUrl?: string }).githubUrl &&
      !(parsed.data as unknown as { githubUrl?: string; repoUrl?: string }).repoUrl
    ) {
      (parsed.data as unknown as { githubUrl?: string; repoUrl?: string }).repoUrl = (
        parsed.data as unknown as { githubUrl?: string }
      ).githubUrl as string;
    }
    const exists = await Project.findOne({ slug: parsed.data.slug }).lean();
    if (exists) return res.status(409).json({ error: '[[PROJECTS_CREATE]]-[SERVER]: slug_exists' });
    // If client sent techStack (names), try to resolve to technologyIds
    let technologyIds: string[] | undefined = parsed.data.technologyIds as unknown as string[];
    if (
      (!technologyIds || technologyIds.length === 0) &&
      (parsed.data.techStack?.length || 0) > 0
    ) {
      const names = parsed.data.techStack as string[];
      const techs = await Technology.find({ name: { $in: names } })
        .select('_id name')
        .lean();
      technologyIds = techs.map((t) => String(t._id));
    }
    const project = await Project.create({ ...parsed.data, technologyIds });
    return res.status(201).json({ project });
  } catch (err) {
    console.error('Project creation failed:', err);
    return res.status(400).json({ error: '[[PROJECTS_CREATE]]-[SERVER]: invalid_request', details: err instanceof Error ? err.message : String(err) });
  }
});

// PATCH /projects/:id → update (auth required, owner only)
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId)
      return res.status(401).json({ error: '[[PROJECTS_UPDATE]]-[SERVER]: unauthorized' });
    const id = req.params.id;
    const parsed = schemas.ProjectsUpdateReq.parse(req.body);
    const current = await Project.findById(parsed.id).lean();
    if (!current) return res.status(404).json({ error: '[[PROJECTS_UPDATE]]-[SERVER]: not_found' });
    if (current.ownerId !== userId)
      return res.status(403).json({ error: '[[PROJECTS_UPDATE]]-[SERVER]: forbidden' });
    const updates: Record<string, unknown> = { ...parsed.data };
    if (updates.githubUrl && !updates.repoUrl) {
      updates.repoUrl = updates.githubUrl;
    }

    // If technologyIds not provided but techStack names are, resolve them
    if (
      (!(updates as { technologyIds?: string[] }).technologyIds ||
        (updates as { technologyIds?: string[] }).technologyIds?.length === 0) &&
      ((updates as { techStack?: string[] }).techStack?.length || 0) > 0
    ) {
      const names = (updates as { techStack: string[] }).techStack;
      const techs = await Technology.find({ name: { $in: names } })
        .select('_id name')
        .lean();
      (updates as { technologyIds?: string[] }).technologyIds = techs.map((t) => String(t._id));
    }

    // Handle hero image cleanup if the heroImageUrl is being changed
    const newHeroImageUrl = updates.heroImageUrl as string | null | undefined;
    const oldHeroImageUrl = current.heroImageUrl;

    // If heroImageUrl is being removed (set to null/empty) or changed to a different URL
    if (oldHeroImageUrl && (newHeroImageUrl === null || newHeroImageUrl === '' || (newHeroImageUrl && newHeroImageUrl !== oldHeroImageUrl))) {
      await cleanupOldHeroImage(oldHeroImageUrl, parsed.id);
    }

    const project = await Project.findByIdAndUpdate(parsed.id, { $set: updates }, { new: true }).lean();
    return res.json({ project });
  } catch (err) {
    console.error('Project update failed:', err);
    return res.status(400).json({ error: '[[PROJECTS_UPDATE]]-[SERVER]: invalid_request' + err });
  }
});

// DELETE /projects/:id → delete (auth required, owner only)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId)
      return res.status(401).json({ error: '[[PROJECTS_DELETE]]-[SERVER]: unauthorized' });
    const id = req.params.id;
    const parsed = schemas.ProjectsDeleteReq.parse({ version: 'v1', id });
    const current = await Project.findById(parsed.id).lean();
    if (!current) return res.json({ ok: true });
    if (current.ownerId !== userId)
      return res.status(403).json({ error: '[[PROJECTS_DELETE]]-[SERVER]: forbidden' });
    await Project.findByIdAndDelete(parsed.id);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(400).json({ error: '[[PROJECTS_DELETE]]-[SERVER]: invalid_request' + err });
  }
});

export default router;
