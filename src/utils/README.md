# utils/

Small, dependency-light helper functions used across the app.

| File | Purpose |
|---|---|
| `jwt.js` | `signAccessToken`, `signRefreshToken`, `verifyToken` |
| `password.js` | `hashPassword`, `comparePassword` (bcrypt) |
| `response.js` | `success(res, status, data)` / `error(res, status, message)` — keeps every API response the same shape: `{ success, data | message }` |
| `logger.js` | Pino/Winston instance, so `console.log` never ships to production |

Nothing in here should import from `services/` or `models/` — utils are
one-way, reusable leaf functions.
