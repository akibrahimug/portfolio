import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoTechnologiesRepo } from '../technologiesRepo';

jest.setTimeout(20000);

describe('MongoTechnologiesRepo', () => {
  let mongod: MongoMemoryServer;
  let repo: MongoTechnologiesRepo;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri('portfolio'));
    repo = new MongoTechnologiesRepo();
    await repo.ensureIndexes();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('creates, gets by id, lists, updates and deletes', async () => {
    const created = await repo.create({
      name: 'A',
      category: 'frontend',
      description: 'd',
      complexity: 'beginner',
      icon: 'a',
      color: 'red',
      experience: 'beginner',
      learningSource: 'a',
      confidenceLevel: 1,
    });
    expect(created.name).toBe('A');

    const fetched = await repo.getById('a');
    expect(fetched?.name).toBe('A');

    const list = await repo.list();
    expect(list.length).toBeGreaterThan(0);

    const updated = await repo.updateById(String(created._id), { name: 'A2' });
    expect(updated?.name).toBe('A2');

    await repo.deleteById(String(created._id));
    const missing = await repo.getById('a');
    expect(missing).toBeNull();
  });

  it('enforces unique name on create', async () => {
    await repo.create({
      name: 'B',
      category: 'frontend',
      description: 'd',
      complexity: 'beginner',
      icon: 'a',
      color: 'red',
      experience: 'beginner',
      learningSource: 'a',
      confidenceLevel: 1,
    });
    await expect(
      repo.create({
        name: 'B2',
        category: 'frontend',
        description: 'd',
        complexity: 'beginner',
        icon: 'a',
        color: 'red',
        experience: 'beginner',
        learningSource: 'a',
        confidenceLevel: 1,
      }),
    ).rejects.toThrow(/name already exists/);
  });
});
