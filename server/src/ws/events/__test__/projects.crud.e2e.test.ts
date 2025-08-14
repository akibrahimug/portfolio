import bunyan from 'bunyan';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { buildSchemas } from '../../../schemas';
import { registerProjectEvents } from '../..//events/projects';
import type { RequestContext, AuthenticatedRequest } from '../../../lib/context';
import type { WebSocket } from 'ws';

class FakeSocket {
  last?: { event: string; payload: unknown };
  send(data: string) {
    this.last = JSON.parse(data);
  }
}

function makeCtx(): RequestContext {
  const req = { userId: 'user1' } as unknown as AuthenticatedRequest;
  const log = bunyan.createLogger({ name: 'test', level: 'fatal' });
  return { requestId: 'r1', log, req } as unknown as RequestContext;
}

describe('Projects CRUD e2e (direct handlers)', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri('portfolio'));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it('create, update, delete with ownership', async () => {
    const schemas = buildSchemas();
    const handlers = registerProjectEvents(schemas);
    const socket = new FakeSocket();
    const ctx = makeCtx();

    await handlers.create(
      socket as unknown as WebSocket,
      {
        version: 'v1',
        data: {
          title: 'T',
          slug: 't',
          kind: 'frontend',
          description: 'd',
          techStack: [],
          tags: [],
          visibility: 'public',
          status: 'draft',
          ownerId: 'user1',
        },
      },
      ctx,
    );
    expect(socket.last?.event).toBe('projects:create');
    const projId = (socket.last?.payload as { project: { _id: string } }).project._id;

    await handlers.update(
      socket as unknown as WebSocket,
      { version: 'v1', id: projId, data: { title: 'T2' } },
      ctx,
    );
    expect((socket.last?.payload as { project: { title: string } }).project.title).toBe('T2');

    await handlers.remove(socket as unknown as WebSocket, { version: 'v1', id: projId }, ctx);
    expect((socket.last?.payload as { ok: boolean }).ok).toBe(true);
  });
});
