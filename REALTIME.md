# How real-time works here (the "Instagram" behavior)

## The analogy, mapped to our tables

| Instagram concept | This project |
|---|---|
| A private circle of friends | `shared_spaces` row |
| Following someone / being a follower | a row in `space_members` |
| A post | a row in `resources` |
| Liking a post | a row in `resource_likes` |
| "New post from someone you follow shows up instantly" | WebSocket broadcast to everyone connected to that space |
| "Like count updates as people tap the heart" | WebSocket broadcast on every like/unlike |

So: **you don't "follow" a person directly** — you're a member of a
*space*, and everyone in that space sees everything posted in it, live.
That's simpler than Instagram's global follower graph and fits what you
described (a shared vault/group).

## Why WebSockets, not polling, and why no external service

Real-time normally makes people reach for Pusher/Firebase/Ably. We don't
need any of that for a single self-hosted server — Node's own `http` server
can also run a WebSocket server on the same port using the `ws` package.
Nothing leaves your machine.

```
                     Same Express/Node process
        ┌───────────────────────────────────────────┐
        │                                             │
        │   HTTP (Express)          WebSocket (ws)    │
        │   /api/v1/...             ws://.../socket   │
        │                                             │
        └───────────────────────────────────────────┘
                          │
                          ▼
                     PostgreSQL
```

## Connection flow

```
1. User logs in over normal HTTP → gets a JWT.
2. Client opens: new WebSocket(`ws://localhost:5000?token=<jwt>`)
3. config/socket.js verifies the JWT on connect, rejects if invalid.
4. Client sends: { "event": "join_space", "spaceId": "8f23..." }
5. Server checks space_members (only actual members can join that room).
6. Server adds this socket to an in-memory Map: spaceId -> Set<socket>
```

## Broadcasting a new post

```
Jashu POSTs /api/v1/shared-spaces/:spaceId/resources
        │
        ▼
resource.service.js inserts the row into `resources`
        │
        ▼
realtime.service.js → socket.broadcastToSpace(spaceId, {
    event: "new_post",
    data: resource
})
        │
        ▼
Every socket currently in that spaceId's room receives it
        │
        ▼
Ravi & Kiran's browsers get the event and prepend it to their feed —
no refresh, no polling.
```

## Broadcasting a like

```
Ravi POSTs /api/v1/resources/:id/like
        │
        ▼
like.service.js inserts/deletes a row in `resource_likes`,
recomputes the count
        │
        ▼
realtime.service.js → socket.broadcastToSpace(spaceId, {
    event: "like_updated",
    data: { resourceId, likeCount }
})
        │
        ▼
Everyone watching that resource's like count sees it update live
```

## What if the client isn't connected (app closed, phone asleep)?

WebSockets only deliver while connected. That's fine here — when the client
reconnects (or opens the app), it does a normal `GET
/shared-spaces/:id/resources` to fetch the current feed from PostgreSQL,
same as Instagram re-syncing on app open. The socket is only for *live*
updates while you're actively looking at a space.

## If you ever outgrow a single server instance

Right now the "room" membership (`spaceId -> Set<socket>`) lives in memory
in one Node process, which is correct and simplest for one server. If you
later run multiple instances behind a load balancer, a socket on instance A
won't see a broadcast triggered on instance B. At that point (and only at
that point) you'd add a local Redis instance purely as a pub/sub relay
between your own server processes — still nothing external/cloud, just
another local service, same as Postgres. Not needed for v1.
# Shared Resource Platform (Backend)

# Shared Resource Platform (Backend)

A local-first, self-hosted backend where a user creates a **Shared Space**
(like a WhatsApp/Instagram group), adds members, and posts **Resources**
(text, images, PDFs, MP3, MP4, ZIP, etc). Members can **view / download /
stream / like** resources but cannot edit or delete someone else's post.

```
Family Space
 ├── Jashu posts vacation.mp4   → everyone in the space sees it instantly
 ├── Ravi likes vacation.mp4    → like-count updates live for everyone
 └── Kiran posts notes.pdf      → shows up at the top of everyone's feed
```

This README is the single reference for the whole project — dependencies,
architecture, how auth works, how streaming works, how real-time works,
and how to run/troubleshoot it. Each folder also has its own short
`README.md` for what belongs in that specific folder.

---

## 1. Everything runs locally — no external/cloud services

| Concern            | Used here                              | NOT used             |
|---------------------|-----------------------------------------|-----------------------|
| Database            | PostgreSQL (local instance)             | ❌ AWS RDS, Supabase  |
| File storage         | Local disk (`/uploads` folder)          | ❌ S3 / R2 / Blob     |
| Real-time updates    | Plain Node.js `ws` WebSocket server     | ❌ Pusher, Firebase   |
| API docs             | Swagger (swagger-jsdoc + swagger-ui)    | ❌ Postman cloud      |
| Auth                 | JWT signed locally                      | ❌ Auth0, Clerk       |

Every table, every file, every socket connection lives on your machine.

---

## 2. Dependencies — what each one does and where it's used

### Runtime (`dependencies`)

| Package | Version | What it does | Used in |
|---|---|---|---|
| **express** | ^4.19.2 | The HTTP web framework — routing, middleware pipeline, request/response handling. Everything is built on top of it. | `src/app.js`, every file in `routes/` |
| **pg** | ^8.11.5 | Official PostgreSQL driver for Node (`node-postgres`). Gives us a connection `Pool` and lets us run parameterized SQL queries directly — no ORM. | `src/config/db.js`, every file in `models/` |
| **jsonwebtoken** | ^9.0.2 | Signs and verifies the JWT access/refresh tokens used for authentication. | `src/utils/jwt.js` |
| **bcrypt** | ^5.1.1 | One-way hashing for user passwords (12 salt rounds) — we never store plaintext passwords. | `src/utils/password.js` |
| **multer** | ^1.4.5-lts.1 | Handles `multipart/form-data` file uploads and writes them straight to **local disk** (`diskStorage`, not memory or S3). | `src/middleware/upload.middleware.js` |
| **joi** | ^17.13.1 | Schema validation for every request body (register/login payloads, space/member/resource payloads) before it ever reaches a controller. | `src/validators/*.js`, `src/middleware/validation.middleware.js` |
| **ws** | ^8.17.0 | Minimal WebSocket server library, attached to the *same* HTTP server/port as Express. This is the entire real-time engine — no external pub/sub service. | `src/config/socket.js` |
| **swagger-jsdoc** | ^6.2.8 | Reads the `@swagger` JSDoc comments above each route and turns them into a live OpenAPI spec. | `src/config/swagger.js` |
| **swagger-ui-express** | ^5.0.0 | Renders that OpenAPI spec as the interactive docs page. | mounted at `/api-docs` in `src/app.js` |
| **helmet** | ^7.1.0 | Sets a batch of security-related HTTP headers (CSP, no-sniff, frame options, etc) on every response. | `src/app.js` |
| **cors** | ^2.8.5 | Controls which origins are allowed to call the API from a browser. | `src/app.js`, controlled by `CORS_ORIGIN` in `.env` |
| **express-rate-limit** | ^7.2.0 | Throttles repeated requests (20 per 15 min) on the auth routes specifically, to slow down brute-force login/register attempts. | `src/middleware/rateLimit.middleware.js` |
| **dotenv** | ^16.4.5 | Loads variables from your `.env` file into `process.env` at startup. | `src/config/env.js` (first line of the whole app) |
| **pino** | ^9.1.0 | Fast structured JSON logger — this is what prints those `{"level":50,...}` blocks in your terminal when something errors. | `src/utils/logger.js`, `src/middleware/error.middleware.js` |

### Dev-only (`devDependencies`)

| Package | What it does |
|---|---|
| **nodemon** | Restarts the server automatically whenever a `.js/.json` file changes. Powers `npm run dev`. **Note:** it does *not* watch `.env` — you must manually restart after editing `.env`. |
| **jest** | Test runner for everything under `tests/`. |
| **supertest** | Lets tests fire real HTTP requests at the Express app without actually binding a port. |

No ORM (Prisma/Sequelize/TypeORM), no cloud SDKs (aws-sdk, firebase-admin), no separate real-time service package — those were deliberately left out per the "local only" requirement.

---

## 3. Full request lifecycle (how a typical request is actually handled)

```
Browser / Swagger / curl
        │
        ▼
   Express app.js
   helmet → cors → express.json() → static(/public)
        │
        ▼
   Route file (routes/*.js)
        │
        ▼
   authMiddleware            → verifies JWT, sets req.user
        │
        ▼
   authorizationMiddleware   → (only on OWNER-only routes) checks
                                space_members for this user+space
        │
        ▼
   validate(schema)          → Joi checks req.body/query/params
        │
        ▼
   Controller                → thin: reads req, calls a service, sends response
        │
        ▼
   Service                   → business logic, calls model(s), may trigger
                                a realtime broadcast or audit log
        │
        ▼
   Model                     → raw parameterized SQL via the pg Pool
        │
        ▼
   PostgreSQL
        │
        ▼
   response.success(res, ...) → { success: true, data: ... }
```

Anything that throws along the way falls through to `error.middleware.js`,
which logs the full error with `pino` (visible in your terminal) and sends
back a generic `{ success: false, message: "Internal server error" }` to
the client — deliberately vague to the client, fully detailed in your logs.

---

## 4. Authentication — how login/tokens work

```
POST /auth/register  → bcrypt-hashes the password, INSERT into users
POST /auth/login     → bcrypt.compare(), then signs 2 JWTs:
                          accessToken  (short-lived, 15m default)
                          refreshToken (long-lived, 7d default)
POST /auth/refresh   → verifies the refreshToken, issues a new accessToken
```

Every protected route expects:
```
Authorization: Bearer <accessToken>
```

`auth.middleware.js` also accepts the token as a **query parameter**
(`?token=...`) — see section 6 below for why that exists specifically for
streaming media.

`JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` in `.env` must be **non-empty**
strings — an empty secret makes `jsonwebtoken` throw when signing a token,
which is a common cause of a 500 error specifically on `/auth/login` (it
doesn't affect `/auth/register`, since register never signs a token).

---

## 5. Authorization — how permissions are enforced

Two roles per space, stored in `space_members.role`:

| Operation       | OWNER | VIEWER |
| --------------- | :---: | :----: |
| View space / members |  ✅  |  ✅  |
| Add / remove members  |  ✅  |  ❌  |
| Post text / upload file |  ✅  |  ❌  |
| View / download / stream |  ✅  |  ✅  |
| Like / unlike           |  ✅  |  ✅  |
| Update / delete space   |  ✅  |  ❌  |

This is enforced **server-side only**, in
`middleware/authorization.middleware.js`, which looks up the caller's row
in `space_members` for the given `spaceId` and checks it against
`constants/permissions.js`. The frontend never decides this — hiding a
button in the UI is not security, a VIEWER calling the upload endpoint
directly with Postman still gets a `403`.

---

## 6. How file upload + streaming works (the deep dive)

### Upload

```
Owner picks a file in the demo UI
        │  multipart/form-data POST
        ▼
POST /shared-spaces/:spaceId/resources/upload
        │
        ▼
upload.middleware.js (Multer, diskStorage)
   - validates mimetype against an allow-list
   - validates size against MAX_FILE_SIZE_MB
   - writes the raw bytes straight to disk at:
       uploads/spaces/<spaceId>/resources/<uuid>-<safe-filename>
        │
        ▼
resource.service.js → resource.model.js
   - detects resourceType from mimetype (IMAGE/VIDEO/AUDIO/DOCUMENT/etc)
   - saves ONLY the metadata + relative path ("storage_key") to Postgres
   - the actual file bytes are never touched by Postgres
        │
        ▼
realtime.service.js broadcasts "new_post" over WebSocket
   → every connected member's feed updates instantly
```

### Streaming (playing a video/audio/image back)

This is the part that trips people up, so here's the full picture.

**Problem:** `<video>`, `<audio>`, and `<img>` tags are plain HTML — they
can't attach a custom `Authorization: Bearer <token>` header the way
`fetch()` can. But every resource endpoint is authenticated.

**Solution used here:** `auth.middleware.js` accepts the JWT from *either*:
```js
Authorization: Bearer <token>     // used by all JSON API calls (fetch)
?token=<token>                    // used only by <video>/<audio>/<img> src=
```
So the demo UI just points the tag straight at the server:
```html
<video controls src="/api/v1/resources/<id>/stream?token=<jwt>"></video>
```
and the **browser itself** handles the HTTP request natively — including
sending an `HTTP Range` header when the user scrubs the video timeline.

**On the server**, `resource.controller.js` → `stream()` reads that
`Range` header and `storage.service.js` → `streamFile()` responds with a
partial-content stream:

```
No Range header  → 200 OK, whole file streamed via fs.createReadStream
Range: bytes=X-Y → 206 Partial Content, Content-Range header set,
                    only that byte slice is read off disk and sent
```

This is exactly how YouTube/Instagram-style seeking works under the hood —
the browser only ever downloads the bytes it currently needs, and jumping
to the middle of a 500MB video doesn't require downloading the first
499MB first.

`/download` (as opposed to `/stream`) always returns the whole file at
once with a `Content-Disposition: attachment` header, which is what
triggers a browser's normal "Save As" behavior instead of inline playback.

**Why you saw "unreadable text" earlier:** the very first version of the
demo UI fetched the whole file into a JavaScript `Blob` first, then
assigned it to `video.src` — a fragile approach. That's been replaced with
the direct `?token=` streaming above, which is simpler and matches how a
real video player works.

---

## 7. Real-time (Instagram-style live feed)

Full write-up with diagrams: [`REALTIME.md`](./REALTIME.md). Short version:

```
Space  = a group (like a private Instagram circle)
Member = a follower inside that group
Resource = a post
Like    = a like on that post

Jashu posts → saved to Postgres → broadcast "new_post" over WebSocket
                                 → every member's feed updates, no refresh

Ravi likes  → saved to Postgres → broadcast "like_updated" over WebSocket
                                 → like count updates live for everyone
```

The WebSocket server (`config/socket.js`) keeps an in-memory map of
`spaceId -> Set of connected sockets` ("rooms"). A client authenticates on
connect (`?token=`), then sends `{ event: "join_space", spaceId }` to join
a room. Broadcasts only ever go to sockets in that room.

---

## 8. Database schema

Defined in [`migrations/0001_init.sql`](./migrations/0001_init.sql):

```
users            → id, full_name, email, password_hash, ...
shared_spaces    → id (uuid), name, description, created_by
space_members    → space_id + user_id + role (OWNER | VIEWER)
resources        → id (uuid), space_id, uploaded_by, resource_type,
                    title, original_name, storage_key, mime_type,
                    file_size, text_content, is_deleted
resource_likes   → resource_id + user_id (unique pair = one like each)
audit_logs       → user_id, space_id, resource_id, action, metadata
```

No ORM — every query lives in `src/models/*.js` as plain parameterized
SQL (`$1, $2, ...` placeholders), which is what prevents SQL injection.

---

## 9. Folder structure — each folder has its own README.md

```
src/
├── config/         → env, db pool, local storage path, socket, swagger setup
├── controllers/     → req/res handlers, call services, stay thin
├── routes/           → Express routers + Swagger JSDoc annotations
├── services/         → business logic (incl. realtime.service.js, storage.service.js)
├── middleware/       → auth, role checks, file upload, validation, errors
├── models/           → raw SQL query functions, one file per table
├── validators/       → Joi schemas
├── utils/             → jwt, password hashing, response shape, logger
└── constants/         → roles, resource types, permissions, socket events
migrations/            → plain SQL migration files, run in order
tests/                  → unit / integration / e2e
uploads/                → local disk storage for actual files (gitignored)
public/                  → the demo UI (see public/README.md)
```

---

## 10. API reference

Full interactive docs (mandatory, always on): **`http://localhost:5000/api-docs`**

| Method | Path | Auth | Role |
|---|---|---|---|
| POST | `/api/v1/auth/register` | — | — |
| POST | `/api/v1/auth/login` | — | — |
| POST | `/api/v1/auth/refresh` | — | — |
| POST | `/api/v1/shared-spaces` | ✅ | any |
| GET | `/api/v1/shared-spaces` | ✅ | any |
| GET | `/api/v1/shared-spaces/:spaceId` | ✅ | member |
| PATCH | `/api/v1/shared-spaces/:spaceId` | ✅ | OWNER |
| DELETE | `/api/v1/shared-spaces/:spaceId` | ✅ | OWNER |
| POST | `/api/v1/shared-spaces/:spaceId/members` | ✅ | OWNER |
| GET | `/api/v1/shared-spaces/:spaceId/members` | ✅ | member |
| DELETE | `/api/v1/shared-spaces/:spaceId/members/:userId` | ✅ | OWNER |
| POST | `/api/v1/shared-spaces/:spaceId/resources` | ✅ | OWNER |
| POST | `/api/v1/shared-spaces/:spaceId/resources/upload` | ✅ | OWNER |
| GET | `/api/v1/shared-spaces/:spaceId/resources` | ✅ | member |
| GET | `/api/v1/resources/:id` | ✅ | member |
| GET | `/api/v1/resources/:id/download` | ✅ (header or `?token=`) | member |
| GET | `/api/v1/resources/:id/stream` | ✅ (header or `?token=`) | member |
| POST | `/api/v1/resources/:id/like` | ✅ | member |
| GET | `/api/v1/health` | — | — |

---

## 11. Setup

```bash
git clone <your-repo>
cd shared-resource-platform
npm install
cp .env.example .env        # fill in your local Postgres creds + JWT secrets
psql -U postgres -d your_db -f migrations/0001_init.sql
npm run dev
```

Then open:

- API base: `http://localhost:5000/api/v1`
- **Swagger docs**: `http://localhost:5000/api-docs`
- **Demo UI**: `http://localhost:5000/` (serves `public/index.html`)

### `.env` reference

```env
NODE_ENV=development
PORT=5000

PG_USER=postgres
PG_HOST=localhost
PG_DATABASE=your_db_name        # must already exist — create it first
PG_PASSWORD=your_postgres_password
PG_PORT=5432

JWT_ACCESS_SECRET=any_non_empty_random_string   # required, empty breaks login
JWT_REFRESH_SECRET=any_non_empty_random_string  # required, empty breaks login
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5000

UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=200
```

**Important:** `nodemon` only watches `.js/.json` files — it does **not**
restart the server when you edit `.env`. Stop (`Ctrl+C`) and re-run
`npm run dev` any time you change it.

---

## 12. Common issues & what they mean

| Symptom | Cause |
|---|---|
| `psql: command not found` | Postgres's `bin` folder isn't on PATH. Run it via full path, e.g. `& "C:\Program Files\PostgreSQL\18\bin\psql.exe"` on Windows. |
| `column "full_name" of relation "users" does not exist` | The migration wasn't (fully) applied to the database your `.env` actually points to. `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` then re-run `migrations/0001_init.sql`. |
| Register works, Login returns 500 | `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` are empty in `.env`. Register never signs a token; login does. |
| `Register failed: Email is already registered` | Correct behavior (409), not a bug — that email already has an account. Use Login instead. |
| Video/audio won't play or shows garbled bytes | Make sure you're on the current `public/index.html`, which streams via `?token=` directly in the `src=`, not the older blob-fetch approach. |
| `403 You do not have permission` | Working as intended — only `OWNER` members can post/upload/manage a space; `VIEWER`s can only view/download/stream/like. |

---

## 13. Simple UI

`public/index.html` is a single plain HTML/CSS/JS file (no React, no build
step) — login, create/join a space, post text or upload a file, and watch
the feed + like counts update live. See [`public/README.md`](./public/README.md)
for details on how the media streaming works from the frontend side.

### 
NODE_ENV=development
PORT=5000

# Local PostgreSQL only
PG_USER=postgres
PG_HOST=localhost
PG_DATABASE=shared_resource_platform
PG_PASSWORD=Jaswanth@1234
PG_PORT=5432



# Leave empty for local development.
# We will put the Supabase URL here later for production.
 DATABASE_URL=postgresql://postgres.qhandtgsneateuqbqpeb:Jaswanth%401234@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
# =========================================================
# JWT
# =========================================================

JWT_ACCESS_SECRET=myLocalDevAccessSecret123
JWT_REFRESH_SECRET=myLocalDevRefreshSecret456
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d


# =========================================================
# CORS
# =========================================================
CORS_ORIGIN=http://localhost:5000

# =========================================================
# FILE UPLOAD
# =========================================================

# Local disk storage — no S3/cloud keys needed
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=200

###