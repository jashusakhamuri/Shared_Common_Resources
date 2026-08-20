// const http = require('http');
// const app = require('./app');
// const { attachSocketServer } = require('./config/socket');
// const env = require('./config/env');

// const server = http.createServer(app);

// // Attaches a plain `ws` WebSocket server to the SAME http server/port.
// // No separate service, no external process — see REALTIME.md.
// attachSocketServer(server);

// server.listen(env.PORT, () => {
//   console.log(`API      → http://localhost:${env.PORT}/api/v1`);
//   console.log(`Docs     → http://localhost:${env.PORT}/api-docs`);
//   console.log(`Demo UI  → http://localhost:${env.PORT}/`);
//   console.log(`WebSocket→ ws://localhost:${env.PORT}`);
// });
const http = require('http');

const app = require('./app');

const {
  attachSocketServer,
} = require('./config/socket');

const env = require('./config/env');

/**
 * Create HTTP server using Express application.
 *
 * We use one HTTP server for:
 *
 * - Express REST API
 * - HTML frontend
 * - WebSocket
 */
const server = http.createServer(app);

/**
 * Attach WebSocket server to the SAME HTTP server.
 *
 * Local:
 *
 * ws://localhost:5000
 *
 * Production:
 *
 * wss://your-app.onrender.com
 */
attachSocketServer(server);

/**
 * Start server.
 *
 * 0.0.0.0 is important for cloud deployment.
 *
 * Render provides the PORT environment variable.
 *
 * Local development:
 *
 * PORT=5000
 *
 * Render:
 *
 * PORT=<automatically provided>
 */
server.listen(
  env.PORT,
  '0.0.0.0',
  () => {
    console.log(
      `Server running on port ${env.PORT}`
    );

    console.log(
      `Environment: ${env.NODE_ENV}`
    );

    console.log(
      `API      → http://localhost:${env.PORT}/api/v1`
    );

    console.log(
      `Docs     → http://localhost:${env.PORT}/api-docs`
    );

    console.log(
      `Demo UI  → http://localhost:${env.PORT}/`
    );

    console.log(
      `WebSocket→ ws://localhost:${env.PORT}`
    );
  }
);