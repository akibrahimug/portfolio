import express from 'express';
import request from 'supertest';

// Mock auth to bypass and inject a userId
jest.mock('../../services/auth', () => ({
  authMiddleware: (
    _req: import('express').Request,
    _res: import('express').Response,
    next: import('express').NextFunction,
  ) => {
    (_req as unknown as { userId?: string }).userId = 'test-user';
    next();
  },
}));

// Mock GCS signed URL generation
jest.mock('@google-cloud/storage', () => {
  class FileMock {
    getSignedUrl() {
      return Promise.resolve(['https://signed-url']);
    }
  }
  class BucketMock {
    file() {
      return new FileMock();
    }
  }
  return {
    Storage: class {
      bucket() {
        return new BucketMock();
      }
    },
  };
});

// Ensure bucket env set
process.env.GCS_BUCKET_UPLOADS = 'test-bucket';

import assetsRouter from '../assets';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/assets', assetsRouter);
  return app;
}

describe('Assets request-upload', () => {
  it('returns technologies/ prefix for projectId=technology', async () => {
    const app = buildApp();
    const res = await request(app).post('/assets/request-upload').send({
      filename: 'icon.svg',
      contentType: 'image/svg+xml',
      size: 1234,
      projectId: 'technology',
      folder: 'tech-icons',
    });
    expect(res.status).toBe(200);
    expect(res.body.objectPath).toMatch(/^technologies\/tech-icons\//);
  });
});
