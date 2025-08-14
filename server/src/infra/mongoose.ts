/**
 * Mongoose connection bootstrap.
 * Validates the URI shape and applies conservative pool/timeout settings
 * suitable for serverless/containerized environments.
 */
import mongoose from 'mongoose';
import { getTaggedLogger } from '../logging/console';
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

  const log = getTaggedLogger('MONGODB');

  log.info({ uri: maskMongoUri(resolvedUri) }, 'mongo connecting');

  // Attach one-time listeners for connection lifecycle
  mongoose.connection.on('connected', () => {
    log.info('mongo connected');
  });
  mongoose.connection.on('disconnected', () => {
    log.warn('mongo disconnected');
  });
  mongoose.connection.on('reconnected', () => {
    log.info('mongo reconnected');
  });
  mongoose.connection.on('error', (err) => {
    log.error({ err }, 'mongo connection error');
  });

  await mongoose.connect(resolvedUri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
  });
  log.info('mongo connection established');
  return mongoose;
}

/**
 * Mask credentials in a Mongo URI for safe logging.
 */
function maskMongoUri(uri: string): string {
  try {
    const u = new URL(uri.replace('mongodb+srv://', 'http://').replace('mongodb://', 'http://'));
    if (u.password) {
      u.password = '***';
    }
    const masked = `${u.username ? `${u.username}:***@` : ''}${u.host}${u.pathname}`;
    if (uri.startsWith('mongodb+srv://')) return `mongodb+srv://${masked}`;
    return `mongodb://${masked}`;
  } catch {
    return uri;
  }
}
