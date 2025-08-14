import WebSocket from 'ws';

const url = process.env.WS_URL || 'ws://localhost:5000/api/v1/ws';
const token = process.env.WS_TOKEN || '';
const clients = Number(process.env.CLIENTS || 50);
const durationSec = Number(process.env.DURATION || 30);

function connectOnce(_id: number): Promise<void> {
  return new Promise((resolve) => {
    const headers: Record<string, string> | undefined = token
      ? { 'Sec-WebSocket-Protocol': `bearer,${token}` }
      : undefined;
    const ws = new WebSocket(url + (token && !headers ? `?token=${token}` : ''), headers);
    ws.on('open', () => {
      ws.send(JSON.stringify({ event: 'system:ping', payload: { version: 'v1', ts: Date.now() } }));
    });
    ws.on('message', () => {});
    ws.on('close', () => resolve());
    setTimeout(() => {
      try {
        ws.close();
      } catch (e) {
        /* noop */
      }
    }, durationSec * 1000);
  });
}

(async () => {
  const start = Date.now();
  await Promise.all(Array.from({ length: clients }, (_, i) => connectOnce(i)));
  const took = (Date.now() - start) / 1000;
  // eslint-disable-next-line no-console
  console.log(`Completed ${clients} connections over ${took}s`);
})();
