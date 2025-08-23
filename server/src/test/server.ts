import http from 'http';
import express from 'express';
import cors from 'cors';
import bunyan from 'bunyan';
import { WebSocketServer } from 'ws';
import config from '../config';
import { buildSchemas } from '../schemas';
import { buildHandlers } from '../ws/handlers';
import { snapshot } from '../logging/metrics';
import { v4 as uuidv4 } from 'uuid';
import { buildContext } from '../lib/context';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { MongoProjectsRepo } from '../repos/mongo/projectsRepo';
import { MongoAssetsRepo } from '../repos/mongo/assetsRepo';

export async function startTestServer(): Promise<{ url: string; stop: () => Promise<void> }> {
  const app = express();
  app.use(cors({ origin: '*' }));
  app.use(express.json());
  const server = http.createServer(app);

  // Spin up in-memory Mongo and connect
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri('portfolio');
  await mongoose.connect(uri);
  await new MongoProjectsRepo().ensureIndexes();
  await new MongoAssetsRepo().ensureIndexes();

  // Minimal HTTP endpoints
  app.get(`${config.apiBase}/healthz`, (_req, res) => res.json({ ok: true }));
  app.get(`${config.apiBase}/stats`, (_req, res) => res.json(snapshot(0)));

  const wss = new WebSocketServer({ server, path: `${config.apiBase}/ws` });
  const log = bunyan.createLogger({ name: 'test', level: 'fatal' });
  const schemas = buildSchemas();
  const { handleMessage, onConnection } = buildHandlers({
    log,
    schemas,
  });

  wss.on('connection', (socket, req) => {
    // Attach a test identity so authenticated events can run
    (req as unknown as { userId?: string }).userId = 'test_user';
    const ctx = buildContext({ requestId: uuidv4(), log, req });
    onConnection(socket, ctx).catch(() => {});
    socket.on('message', (raw) => handleMessage(socket, raw as Buffer, ctx));
  });

  await new Promise<void>((resolve) => server.listen(0, () => resolve()));
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  const url = `http://127.0.0.1:${port}`;
  return {
    url,
    stop: async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await mongoose.disconnect();
      await mongod.stop();
    },
  };
}
