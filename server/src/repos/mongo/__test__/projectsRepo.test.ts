import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoProjectsRepo } from '../projectsRepo';

jest.setTimeout(20000);

describe('MongoProjectsRepo', () => {
  let mongod: MongoMemoryServer;
  let repo: MongoProjectsRepo;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri('portfolio'));
    repo = new MongoProjectsRepo();
    await repo.ensureIndexes();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('creates, gets by slug, lists, updates and deletes', async () => {
    const created = await repo.create({
      title: 'A',
      slug: 'a',
      kind: 'frontend',
      description: 'd',
      techStack: [],
      tags: [],
      visibility: 'public',
      status: 'draft',
      ownerId: 'u1',
      views: 0,
      likes: 0,
    });
    expect(created.slug).toBe('a');

    const fetched = await repo.getBySlug('a');
    expect(fetched?.title).toBe('A');

    const list = await repo.list({ limit: 10, filter: { kind: 'frontend' } });
    expect(list.items.length).toBeGreaterThan(0);

    const updated = await repo.updateById(String(created._id), { title: 'A2' });
    expect(updated?.title).toBe('A2');

    await repo.deleteById(String(created._id));
    const missing = await repo.getBySlug('a');
    expect(missing).toBeNull();
  });

  it('enforces unique slug on create', async () => {
    await repo.create({
      title: 'B',
      slug: 'b',
      kind: 'frontend',
      techStack: [],
      tags: [],
      visibility: 'public',
      status: 'draft',
      ownerId: 'u1',
      views: 0,
      likes: 0,
    });
    await expect(
      repo.create({
        title: 'B2',
        slug: 'b',
        kind: 'frontend',
        techStack: [],
        tags: [],
        visibility: 'public',
        status: 'draft',
        ownerId: 'u1',
        views: 0,
        likes: 0,
      }),
    ).rejects.toThrow(/slug already exists/);
  });
});
