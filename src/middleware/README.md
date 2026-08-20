# middleware/

Cross-cutting request handling. Order matters — see the pattern in
`routes/README.md`.

| File | Purpose |
|---|---|
| `auth.middleware.js` | Verifies the JWT, attaches `req.user = { id, email }`. Rejects with 401 if missing/invalid/expired. |
| `authorization.middleware.js` | `authorizationMiddleware('OWNER')` — looks up the caller's row in `space_members` for `req.params.spaceId` and blocks with 403 if their role isn't allowed. **This is the real security boundary** — the frontend hiding a "Delete" button is not security. |
| `upload.middleware.js` | Multer configured with **`diskStorage`** (not `S3Storage`) writing into `uploads/spaces/:spaceId/resources/`. Validates extension + mimetype + file size before saving. |
| `validation.middleware.js` | Runs the matching Joi schema from `validators/` against `req.body`/`req.params`/`req.query`, 400s on failure. |
| `rateLimit.middleware.js` | Basic in-memory rate limiting (e.g. `express-rate-limit`) on auth routes. |
| `error.middleware.js` | Final error handler — turns thrown errors into a consistent JSON shape via `utils/response.js`. |

## The one rule that matters most

```js
// NEVER trust these from the request body:
req.body.userId     // ❌ take from req.user.id (set by auth.middleware)
req.body.role        // ❌ role checks happen server-side against space_members
req.body.spaceId     // ❌ always from req.params, never body, for auth checks
```
