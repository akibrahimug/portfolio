/**
 * WebSocket message envelope used by the service.
 * Each frame is JSON of shape: { event: string, payload: unknown }
 */

export interface WsMessage<T = unknown> {
  event: string;
  payload: T;
}

/**
 * Serialize and send a typed envelope to the client.
 */
export function send<T>(socket: { send(data: string): void }, event: string, payload: T) {
  const message: WsMessage<T> = { event, payload };
  socket.send(JSON.stringify(message));
}
