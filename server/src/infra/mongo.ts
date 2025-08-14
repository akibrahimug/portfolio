import { MongoClient } from 'mongodb';

export async function createMongoClient(uri: string): Promise<MongoClient> {
  if (!uri) throw new Error('MONGODB_URI is required');
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    retryReads: true,
    retryWrites: true,
  });
  await client.connect();
  return client;
}


