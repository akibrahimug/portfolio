import { MongoMemoryServer } from 'mongodb-memory-server';
import { createMongoClient } from '../mongo';

jest.setTimeout(20000);

describe('infra/mongo (native client helper)', () => {
  it('throws when uri is missing', async () => {
    await expect(createMongoClient('' as unknown as string)).rejects.toThrow('MONGODB_URI');
  });

  it('connects to in-memory mongo and closes', async () => {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri('portfolio');
    const client = await createMongoClient(uri);
    expect(client).toBeTruthy();
    await client.close();
    await mongod.stop();
  });
});
