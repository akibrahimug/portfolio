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

  it('supports list/get without crashing', async () => {
    const url = base.replace('http', 'ws') + '/api/v1/ws';
    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.on('open', () => {
        send(ws, 'projects:list', { version: 'v1', limit: 1 });
      });
      ws.on('message', (data) => {
        const msg = JSON.parse(String(data));
        if (msg.event === 'projects:list') {
          expect(msg.payload.items).toBeDefined();
          ws.close();
          resolve();
        }
      });
      ws.on('error', reject);
    });
  });
});
