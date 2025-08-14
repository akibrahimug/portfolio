import bunyan from 'bunyan';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { registerAssetEvents } from '../assets';
import { buildSchemas } from '../../../schemas';
import type { RequestContext, AuthenticatedRequest } from '../../../lib/context';
import type { WebSocket } from 'ws';
import config from '../../../config';

jest.setTimeout(20000);

jest.mock('@google-cloud/storage', () => ({
  Storage: class {
    bucket() {
      return {
        file() {
          return {
            async getSignedUrl() {
              return ['https://signed.example'];
            },
          };
        },
      };
    }
  },
}));

type Frame = { event: string; payload: { uploadUrl: string } };
class FakeSocket {
  frames: Frame[] = [];
  send(s: string) {
    this.frames.push(JSON.parse(s));
  }
}

function makeCtx(): RequestContext {
  const req = { userId: 'u1' } as unknown as AuthenticatedRequest;
  const log = bunyan.createLogger({ name: 'test', level: 'fatal' });
  return { requestId: 'r', log, req } as unknown as RequestContext;
}

describe('Asset events', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri('portfolio'));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('requestUpload validates and returns url envelope', async () => {
    (config as unknown as { gcs: { bucketUploads?: string } }).gcs.bucketUploads = 'test-bucket';
    (
      config as unknown as { uploads: { allowedMime: string[]; maxMb: number } }
    ).uploads.allowedMime = ['text/plain'];
    (config as unknown as { uploads: { allowedMime: string[]; maxMb: number } }).uploads.maxMb = 20;
    const schemas = buildSchemas();
    const h = registerAssetEvents(schemas);
    const sock = new FakeSocket();
    const ctx = makeCtx();
    await h.requestUpload(
      sock as unknown as WebSocket,
      { version: 'v1', projectId: 'p1', filename: 'f.txt', contentType: 'text/plain', size: 1 },
      ctx,
    );
    const last = sock.frames.at(-1)!;
    expect(last.event).toBe('assets:requestUpload');
    expect(last.payload.uploadUrl).toBeDefined();
  });
});
