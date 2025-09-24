import { Router } from 'express';
import type { Request, Response } from 'express';
import { Experience } from '../models/Experience';
import { authMiddleware as requireAuth } from '../services/auth';

const router = Router();

// GET /experiences → list all experiences (requires auth)
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const experiences = await Experience.find({ visibility: 'public' })
      .sort({ createdAt: -1 });
    return res.json(experiences);
  } catch (err) {
    console.error('Error fetching experiences:', err);
    return res.status(500).json({ error: '[[EXPERIENCES_LIST]]-[SERVER]: internal_error' });
  }
});

// POST /experiences → create experience (auth required)
router.post('/', requireAuth, async (req: Request, res: Response) => {
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

    const newExperience = new Experience({
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
      companyLogoUrl: companyLogoUrl || '',
      linkedinUrl: linkedinUrl || '',
      ownerId: (req as unknown as { userId?: string }).userId || 'anonymous',
      visibility: 'public',
    });

    const savedExperience = await newExperience.save();
    console.log('Experience created successfully:', savedExperience._id);
    return res.status(201).json(savedExperience);
  } catch (err) {
    console.error('Error creating experience:', err);
    return res
      .status(400)
      .json({ error: '[[EXPERIENCES_CREATE]]-[SERVER]: invalid_request' });
  }
});

// PUT /experiences/:id → update experience (auth required)
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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

    const updateData: Partial<{
      title: string;
      company: string;
      employmentType: string;
      location: string;
      locationType: string;
      description: string;
      startDate: string;
      endDate: string | null;
      current: boolean;
      skills: string[];
      companyLogoUrl: string;
      linkedinUrl: string;
    }> = {};
    
    if (title !== undefined) updateData.title = title;
    if (company !== undefined) updateData.company = company;
    if (employmentType !== undefined) updateData.employmentType = employmentType;
    if (location !== undefined) updateData.location = location;
    if (locationType !== undefined) updateData.locationType = locationType;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (current !== undefined) {
      updateData.current = current;
      updateData.endDate = current ? null : endDate;
    } else if (endDate !== undefined) {
      updateData.endDate = endDate;
    }
    if (skills !== undefined) updateData.skills = skills;
    if (companyLogoUrl !== undefined) updateData.companyLogoUrl = companyLogoUrl;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;

    const updatedExperience = await Experience.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedExperience) {
      return res.status(404).json({ error: '[[EXPERIENCES_UPDATE]]-[SERVER]: experience_not_found' });
    }

    console.log('Experience updated successfully:', updatedExperience._id);
    return res.json(updatedExperience);
  } catch (err) {
    console.error('Error updating experience:', err);
    return res.status(400).json({ error: '[[EXPERIENCES_UPDATE]]-[SERVER]: invalid_request' });
  }
});

// DELETE /experiences/:id → delete experience (auth required)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedExperience = await Experience.findByIdAndDelete(id);

    if (!deletedExperience) {
      return res.status(404).json({ error: '[[EXPERIENCES_DELETE]]-[SERVER]: experience_not_found' });
    }

    console.log('Experience deleted successfully:', id);
    return res.json({ message: 'Experience deleted successfully', id });
  } catch (err) {
    console.error('Error deleting experience:', err);
    return res.status(400).json({ error: '[[EXPERIENCES_DELETE]]-[SERVER]: invalid_request' });
  }
});

export default router;
