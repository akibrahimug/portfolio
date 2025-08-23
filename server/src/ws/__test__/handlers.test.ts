import bunyan from 'bunyan';
import { buildSchemas } from '../../schemas';

jest.mock('../events/stats', () => ({
  registerStatsEvents: () => ({
    get: async (socket: { send: (s: string) => void }) => {
      socket.send(
        JSON.stringify({
          event: 'stats:get',
          payload: { connections: 1, epm: 0, errorRate: 0, p95ms: 0 },
        }),
      );
    },
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
  it('returns deprecation error for projects/assets events', async () => {
    const schemas = buildSchemas();
    const { buildHandlers } = await import('../handlers');
    const handlers = buildHandlers({
      log: bunyan.createLogger({ name: 'test', level: 'fatal' }),
      schemas,
    });
    const socket = new FakeSocket();
    const ctx = makeCtx('u1');

    // Test projects:create returns deprecation error
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

    const last = socket.frames[socket.frames.length - 1] as {
      event: string;
      payload: { message: string; docs?: string };
    };
    expect(last.event).toBe('system:error');
    expect(last.payload.message).toBe('deprecated_event_use_http');
    expect(last.payload.docs).toBeDefined();
  });

  it('handles stats:get event', async () => {
    const schemas = buildSchemas();
    const { buildHandlers } = await import('../handlers');
    const handlers = buildHandlers({
      log: bunyan.createLogger({ name: 'test', level: 'fatal' }),
      schemas,
    });
    const socket = new FakeSocket();
    const ctx = makeCtx();

    await (
      handlers as unknown as {
        handleMessage: (s: { send: (s: string) => void }, b: Buffer, c: unknown) => Promise<void>;
      }
    ).handleMessage(
      socket as unknown as { send: (s: string) => void },
      Buffer.from(JSON.stringify({ event: 'stats:get', payload: { version: 'v1' } })),
      ctx,
    );

    const last = socket.frames[socket.frames.length - 1] as {
      event: string;
      payload: { connections: number };
    };
    expect(last.event).toBe('stats:get');
    expect(last.payload.connections).toBeDefined();
  });
});
