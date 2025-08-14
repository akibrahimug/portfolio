import WebSocket from 'ws';
import { startTestServer } from '../server';

jest.setTimeout(20000);

function send(socket: WebSocket, event: string, payload: unknown) {
  socket.send(JSON.stringify({ event, payload }));
}

describe('WS integration', () => {
  let base = '';
  let stop: () => Promise<void>;

  beforeAll(async () => {
    const srv = await startTestServer();
    base = srv.url;
    stop = srv.stop;
  });

  afterAll(async () => {
    await stop();
  });

  it('handles system:ping round trip', async () => {
    const url = base.replace('http', 'ws') + '/api/v1/ws';
    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.on('open', () => {
        send(ws, 'system:ping', { version: 'v1', ts: Date.now() });
      });
      ws.on('message', (data) => {
        const msg = JSON.parse(String(data));
        if (msg.event === 'system:ping') {
          expect(msg.payload.pong).toBe(true);
          ws.close();
          resolve();
        }
      });
      ws.on('error', reject);
    });
  });
});
