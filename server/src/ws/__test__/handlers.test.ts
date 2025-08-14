import bunyan from 'bunyan';
import { buildSchemas } from '../../schemas';
import { Project } from '../../models/Project';
import { Asset } from '../../models/Asset';

jest.mock('../events/projects', () => ({
  registerProjectEvents: () => ({
    list: async () => undefined,
    get: async () => undefined,
    create: async (socket: { send: (s: string) => void }) => {
      // Simulate successful create without hitting DB
      socket.send(JSON.stringify({ event: 'projects:create', payload: { ok: true } }));
    },
    update: async () => undefined,
    remove: async () => undefined,
  }),
}));

jest.mock('../events/assets', () => ({
  registerAssetEvents: () => ({
    requestUpload: async () => undefined,
    confirm: async () => undefined,
  }),
}));

jest.mock('../events/stats', () => ({
  registerStatsEvents: () => ({
    get: async () => undefined,
    subscribe: async () => undefined,
  }),
}));

class FakeSocket {
  frames: Array<{ event: string; payload: unknown }> = [];
  send(s: string) {
    this.frames.push(JSON.parse(s));
  }
}

function makeCtx(userId?: string) {
  const log = bunyan.createLogger({ name: 'test', level: 'fatal' });
  return { requestId: 'r', log, req: { userId } } as unknown;
}

jest.setTimeout(20000);

describe('ws handlers', () => {
  it('rate limits sensitive events', async () => {
    process.env.RATE_LIMIT_RPM = '1';
    jest.resetModules();
    const schemas = buildSchemas();
    const { buildHandlers } = await import('../handlers');
    const handlers = buildHandlers({
      log: bunyan.createLogger({ name: 'test', level: 'fatal' }),
      schemas,
      models: { Project, Asset },
    });
    const socket = new FakeSocket();
    const ctx = makeCtx('u1');
    await (
      handlers as unknown as {
        handleMessage: (s: { send: (s: string) => void }, b: Buffer, c: unknown) => Promise<void>;
      }
    ).handleMessage(
      socket as unknown as { send: (s: string) => void },
      Buffer.from(
        JSON.stringify({
          event: 'projects:create',
          payload: {
            version: 'v1',
            data: {
              title: 't',
              slug: 's',
              kind: 'frontend',
              techStack: [],
              tags: [],
              visibility: 'public',
              status: 'draft',
              ownerId: 'u1',
            },
          },
        }),
      ),
      ctx,
    );
    await (
      handlers as unknown as {
        handleMessage: (s: { send: (s: string) => void }, b: Buffer, c: unknown) => Promise<void>;
      }
    ).handleMessage(
      socket as unknown as { send: (s: string) => void },
      Buffer.from(
        JSON.stringify({
          event: 'projects:create',
          payload: {
            version: 'v1',
            data: {
              title: 't2',
              slug: 's2',
              kind: 'frontend',
              techStack: [],
              tags: [],
              visibility: 'public',
              status: 'draft',
              ownerId: 'u1',
            },
          },
        }),
      ),
      ctx,
    );
    const last = socket.frames[socket.frames.length - 1] as {
      event: string;
      payload: { message: string };
    };
    expect(last.event).toBe('system:error');
    expect(last.payload.message).toBe('rate_limited');
  });
});
