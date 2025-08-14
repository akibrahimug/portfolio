"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = send;
/**
 * Serialize and send a typed envelope to the client.
 */
function send(socket, event, payload) {
    const message = { event, payload };
    socket.send(JSON.stringify(message));
}
//# sourceMappingURL=types.js.map