import { send } from '../types';

class FakeSocket {
  sent: string[] = [];
  send(s: string) {
    this.sent.push(s);
  }
}

describe('ws/types send', () => {
  it('wraps event and payload', () => {
    const sock = new FakeSocket();
    send(sock as { send: (s: string) => void }, 'system:ping', { pong: true });
    const frame = JSON.parse(sock.sent[0]);
    expect(frame.event).toBe('system:ping');
    expect(frame.payload.pong).toBe(true);
  });
});
