import { Router } from 'express';
import projectsRouter from './projects';
import assetsRouter from './assets';
import messagesRouter from './messages';
import technologiesRouter from './technologies';
import experiencesRouter from './experiences';

const router = Router();

// Mount all route modules
router.use('/projects', projectsRouter);
router.use('/assets', assetsRouter);
router.use('/messages', messagesRouter);
router.use('/technologies', technologiesRouter);
router.use('/experiences', experiencesRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Portfolio API',
    version: 'v1',
    endpoints: {
      projects: '/api/v1/projects',
      assets: '/api/v1/assets',
      messages: '/api/v1/messages',
      technologies: '/api/v1/technologies',
      experiences: '/api/v1/experiences',
    },
    documentation: 'See README.md for detailed API documentation',
  });
});

export default router;
