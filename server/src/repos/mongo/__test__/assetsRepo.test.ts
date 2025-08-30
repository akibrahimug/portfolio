import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoAssetsRepo } from '../assetsRepo';

jest.setTimeout(20000);

describe('MongoAssetsRepo', () => {
  let mongod: MongoMemoryServer;
  let repo: MongoAssetsRepo;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri('portfolio'));
    repo = new MongoAssetsRepo();
    await repo.ensureIndexes();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('creates asset document', async () => {
    const created = await repo.createAsset({
      projectId: new mongoose.Types.ObjectId().toString(),
      ownerId: 'u1',
      path: 'uploads/x',
      contentType: 'text/plain',
      size: 10,
      assetType: 'project',
    });
    expect(created.path).toBe('uploads/x');
  });
});
