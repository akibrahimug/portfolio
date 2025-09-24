import { Router } from 'express';
import { authMiddleware } from '../services/auth';
import type { Request, Response } from 'express';
import { Technology } from '../models/Technology';
import { buildSchemas } from '../schemas';

const router = Router();
const schemas = buildSchemas();

// GET /technologies → list all technologies (requires auth)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const items = await Technology.find().sort({ createdAt: -1 }).lean();
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: '[[TECHNOLOGIES_LIST]]-[SERVER]: internal_error' });
  }
});

// PATCH /technologies/:id → update technology (auth required)
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = schemas.TechnologiesUpdateReq.parse({ version: 'v1', id, data: req.body });
    const technology = await Technology.findByIdAndUpdate(parsed.id, parsed.data || {}, {
      new: true,
    }).lean();
    if (!technology)
      return res.status(404).json({ error: '[[TECHNOLOGIES_UPDATE]]-[SERVER]: not_found' });
    return res.json({ technology });
  } catch (err) {
    return res
      .status(400)
      .json({ error: '[[TECHNOLOGIES_UPDATE]]-[SERVER]: invalid_request' + err });
  }
});

// DELETE /technologies/:id → delete technology (auth required)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = schemas.TechnologiesDeleteReq.parse({ version: 'v1', id });
    await Technology.findByIdAndDelete(parsed.id);
    return res.json({ ok: true });
  } catch (err) {
    return res
      .status(400)
      .json({ error: '[[TECHNOLOGIES_DELETE]]-[SERVER]: invalid_request' + err });
  }
});

// GET /technologies/:id → get single technology (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const technology = await Technology.findById(id).lean();

    if (!technology) {
      return res.status(404).json({ error: '[[TECHNOLOGIES_GET]]-[SERVER]: technology_not_found' });
    }

    return res.json(technology);
  } catch (err) {
    return res.status(500).json({ error: '[[TECHNOLOGIES_GET]]-[SERVER]: internal_error' });
  }
});

// POST /technologies → create technology (auth required)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = schemas.TechnologiesCreateReq.parse({ version: 'v1', data: req.body });
    const technology = await Technology.create(parsed.data as Record<string, unknown>);
    return res.status(201).json({ technology });
  } catch (err) {
    return res
      .status(400)
      .json({ error: '[[TECHNOLOGIES_CREATE]]-[SERVER]: invalid_request' + err });
  }
});

export default router;
