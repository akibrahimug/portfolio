import { Router } from 'express';
import { authMiddleware } from '../services/auth';
import type { Request, Response } from 'express';

const router = Router();

// Temporary in-memory storage - will be replaced with database
const technologies: Array<{
  _id: string;
  name: string;
  category: string;
  description: string;
  complexity: string;
  teamSize: string;
  flexibility: string;
  timeToImplement: string;
}> = [];

// GET /technologies → list all technologies (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    return res.json(technologies);
  } catch (err) {
    return res.status(500).json({ error: 'internal_error' });
  }
});

// GET /technologies/:id → get single technology (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const technology = technologies.find((tech) => tech._id === id);

    if (!technology) {
      return res.status(404).json({ error: 'technology_not_found' });
    }

    return res.json(technology);
  } catch (err) {
    return res.status(500).json({ error: 'internal_error' });
  }
});

// POST /technologies → create technology (auth required)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, category, description, complexity, teamSize, flexibility, timeToImplement } =
      req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }

    const newTechnology = {
      _id: (technologies.length + 1).toString(),
      name,
      category,
      description: description || '',
      complexity: complexity || 'Beginner',
      teamSize: teamSize || 'Any',
      flexibility: flexibility || 'Medium',
      timeToImplement: timeToImplement || 'TBD',
    };

    technologies.push(newTechnology);
    return res.status(201).json(newTechnology);
  } catch (err) {
    return res.status(400).json({ error: 'invalid_request' });
  }
});

export default router;
