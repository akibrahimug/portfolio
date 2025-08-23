import { Router } from 'express';
import { Project } from '../models/Project';
import { buildSchemas } from '../schemas';
import { authMiddleware } from '../services/auth';
import type { Request, Response } from 'express';

const router = Router();
const schemas = buildSchemas();

// GET /projects → list with filters and cursor paging
router.get('/', async (req: Request, res: Response) => {
  try {
    const parsed = schemas.ProjectsListReq.parse({
      version: 'v1',
      filter: {
        kind: typeof req.query.kind === 'string' ? req.query.kind : undefined,
        tags:
          typeof req.query.tags === 'string' ? (req.query.tags as string).split(',') : undefined,
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
      },
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      cursor: typeof req.query.cursor === 'string' ? req.query.cursor : undefined,
    });

    const filter: Record<string, unknown> = {};
    if (parsed.filter?.kind) filter.kind = parsed.filter.kind;
    if (parsed.filter?.tags?.length) filter.tags = { $in: parsed.filter.tags } as { $in: string[] };
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
    return res.status(400).json({ error: 'invalid_request' });
  }
});

// GET /projects/:idOrSlug → fetch single
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const idOrSlug = req.params.idOrSlug;
    const byId = await Project.findById(idOrSlug).lean();
    const project = byId || (await Project.findOne({ slug: idOrSlug }).lean());
    return res.json({ project: project ?? null });
  } catch {
    return res.status(404).json({ project: null });
  }
});

// POST /projects → create (auth required)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const parsed = schemas.ProjectsCreateReq.parse({
      version: 'v1',
      data: { ...req.body, ownerId: userId },
    });
    const exists = await Project.findOne({ slug: parsed.data.slug }).lean();
    if (exists) return res.status(409).json({ error: 'slug_exists' });
    const project = await Project.create({ ...parsed.data });
    return res.status(201).json({ project });
  } catch (err) {
    return res.status(400).json({ error: 'invalid_request' });
  }
});

// PATCH /projects/:id → update (auth required, owner only)
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const id = req.params.id;
    const parsed = schemas.ProjectsUpdateReq.parse({ version: 'v1', id, data: req.body });
    const current = await Project.findById(parsed.id).lean();
    if (!current) return res.status(404).json({ error: 'not_found' });
    if (current.ownerId !== userId) return res.status(403).json({ error: 'forbidden' });
    const project = await Project.findByIdAndUpdate(parsed.id, parsed.data, { new: true }).lean();
    return res.json({ project });
  } catch (err) {
    return res.status(400).json({ error: 'invalid_request' });
  }
});

// DELETE /projects/:id → delete (auth required, owner only)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const id = req.params.id;
    const parsed = schemas.ProjectsDeleteReq.parse({ version: 'v1', id });
    const current = await Project.findById(parsed.id).lean();
    if (!current) return res.json({ ok: true });
    if (current.ownerId !== userId) return res.status(403).json({ error: 'forbidden' });
    await Project.findByIdAndDelete(parsed.id);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(400).json({ error: 'invalid_request' });
  }
});

export default router;
