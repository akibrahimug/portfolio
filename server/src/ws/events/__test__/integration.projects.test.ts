import WebSocket from 'ws';
import { startTestServer } from '../../../test/server';

jest.setTimeout(20000);

function send(ws: WebSocket, event: string, payload: unknown) {
  ws.send(JSON.stringify({ event, payload }));
}

describe('Projects integration', () => {
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

  it('returns deprecation error for projects over WS', async () => {
    const url = base.replace('http', 'ws') + '/api/v1/ws';
    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.on('open', () => {
        send(ws, 'projects:list', { version: 'v1', limit: 1 });
      });
      ws.on('message', (data) => {
        const msg = JSON.parse(String(data));
        if (msg.event === 'system:error') {
          expect(msg.payload.message).toBe('deprecated_event_use_http');
          ws.close();
          resolve();
        }
      });
      ws.on('error', reject);
    });
  });
});
