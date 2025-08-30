import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

// Temporary in-memory storage - will be replaced with database
const experiences: Array<{
  _id: string;
  title: string;
  company: string;
  employmentType:
    | 'Full-time'
    | 'Part-time'
    | 'Contract'
    | 'Freelance'
    | 'Internship'
    | 'Apprenticeship'
    | 'Seasonal';
  location: string;
  locationType: 'On-site' | 'Remote' | 'Hybrid';
  description: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  skills: string[];
  companyLogoUrl?: string;
  linkedinUrl?: string;
}> = [];

// GET /experiences → list all experiences (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    return res.json(experiences);
  } catch (err) {
    return res.status(500).json({ error: '[[EXPERIENCES_LIST]]-[SERVER]: internal_error' + err });
  }
});

// POST /experiences → create experience (auth required)
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      company,
      employmentType,
      location,
      locationType,
      description,
      startDate,
      endDate,
      current,
      skills,
      companyLogoUrl,
      linkedinUrl,
    } = req.body;

    if (!title || !company || !startDate) {
      return res
        .status(400)
        .json({ error: '[[EXPERIENCES_CREATE]]-[SERVER]: missing_required_fields' });
    }

    const newExperience = {
      _id: (experiences.length + 1).toString(),
      title,
      company,
      employmentType: employmentType || 'Full-time',
      location: location || '',
      locationType: locationType || 'On-site',
      description: description || '',
      startDate,
      endDate: current ? null : endDate,
      current: !!current,
      skills: skills || [],
      companyLogoUrl: companyLogoUrl || undefined,
      linkedinUrl: linkedinUrl || undefined,
    };

    experiences.push(newExperience);
    return res.status(201).json(newExperience);
  } catch (err) {
    return res
      .status(400)
      .json({ error: '[[EXPERIENCES_CREATE]]-[SERVER]: invalid_request' + err });
  }
});

export default router;
