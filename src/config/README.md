# config/

Holds everything that reads environment variables and turns them into
ready-to-use objects. Nothing here talks to the outside world except
Postgres and the local filesystem.

| File | Purpose |
|---|---|
| `env.js` | Loads and validates `.env`. Every other file imports config from here — no `process.env` scattered around the codebase. |
| `db.js` | Creates one shared PostgreSQL connection pool (`pg.Pool`) used by every model. |
| `storage.js` | Defines the **local disk** storage path (`./uploads/spaces/:spaceId/resources/`). This replaces S3 — see `middleware/upload.middleware.js` for how Multer writes here. |
| `swagger.js` | Builds the Swagger/OpenAPI spec with `swagger-jsdoc` from the JSDoc comments in `routes/*.js`, and exports the spec for `swagger-ui-express` to mount at `/api-docs`. |
| `socket.js` | Creates the `ws` WebSocket server attached to the same HTTP server (no separate service) and exposes `broadcastToSpace(spaceId, event)` for `services/realtime.service.js`. |

## Rule of thumb
If a value can change between your laptop and a server (a port, a secret, a
folder path, an expiry time) — it belongs in `.env`, and this folder is where
that `.env` value becomes a usable object.
