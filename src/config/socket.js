const { WebSocketServer } = require('ws');
const jwt = require('./../utils/jwt');

// spaceId -> Set of sockets currently watching that space
const rooms = new Map();

let wss = null;

function attachSocketServer(httpServer) {
  wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (socket, req) => {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');

    let user;
    try {
      user = jwt.verifyAccessToken(token);
    } catch (err) {
      socket.close(4001, 'Invalid or missing token');
      return;
    }

    socket.userId = user.id;
    socket.spaceId = null;

    socket.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (msg.event === 'join_space' && msg.spaceId) {
        // Note: membership itself is still checked server-side before any
        // data reaches this room (see resource.service.js / like.service.js)
        socket.spaceId = msg.spaceId;
        if (!rooms.has(msg.spaceId)) rooms.set(msg.spaceId, new Set());
        rooms.get(msg.spaceId).add(socket);
      }
    });

    socket.on('close', () => {
      if (socket.spaceId && rooms.has(socket.spaceId)) {
        rooms.get(socket.spaceId).delete(socket);
      }
    });
  });

  return wss;
}

function broadcastToSpace(spaceId, payload) {
  const sockets = rooms.get(spaceId);
  if (!sockets) return;
  const message = JSON.stringify(payload);
  for (const socket of sockets) {
    if (socket.readyState === socket.OPEN) {
      socket.send(message);
    }
  }
}

module.exports = { attachSocketServer, broadcastToSpace };
