/**
 * Mongoose connection bootstrap.
 * Validates the URI shape and applies conservative pool/timeout settings
 * suitable for serverless/containerized environments.
 */
import mongoose from 'mongoose';
import config from '../config';

/**
 * Connect to MongoDB using Mongoose.
 * @param uri Optional URI; falls back to config.mongodbUri
 */
export async function connectMongoose(uri: string) {
  const resolvedUri = (uri && uri.trim()) || config.mongodbUri;

  if (!resolvedUri) throw new Error('MONGODB_URI is required');
  if (!resolvedUri.startsWith('mongodb://') && !resolvedUri.startsWith('mongodb+srv://')) {
    throw new Error(
      `Invalid MONGODB_URI. Expected it to start with "mongodb://" or "mongodb+srv://". Got: ${resolvedUri}`,
    );
  }

  await mongoose.connect(resolvedUri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
  });
  return mongoose;
}
