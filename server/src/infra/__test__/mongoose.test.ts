import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectMongoose } from '../mongoose';

jest.setTimeout(20000);

describe('infra/mongoose', () => {
  it('connects with a valid mongodb uri', async () => {
    const mongod = await MongoMemoryServer.create();
    try {
      const uri = mongod.getUri('portfolio');
      await expect(connectMongoose(uri)).resolves.toBeTruthy();
      await mongoose.disconnect();
    } finally {
      await mongod.stop();
    }
  });
  it('throws for invalid uri scheme', async () => {
    await expect(connectMongoose('invalid://uri')).rejects.toThrow(/Invalid MONGODB_URI/);
  });
});
