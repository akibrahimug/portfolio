import { registerStatsEvents } from '../stats';
import { buildSchemas } from '../../../schemas';
import type { WebSocket } from 'ws';

type Frame = { event: string; payload: { connections: number } };

class FakeSocket {
  frames: Frame[];
  constructor() {
    this.frames = [];
  }
  send(s: string) {
    this.frames.push(JSON.parse(s));
  }
  once() {}
}

describe('Stats events', () => {
  it('get returns a snapshot', async () => {
    const s = buildSchemas();
    const h = registerStatsEvents(s, () => 3);
    const sock = new FakeSocket();
    await h.get(sock as unknown as WebSocket);
    const last = sock.frames.at(-1)!;
    expect(last.event).toBe('stats:get');
    expect(last.payload.connections).toBe(3);
  });
});
