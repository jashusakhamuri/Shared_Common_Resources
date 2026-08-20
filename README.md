# Shared Resource Platform (Backend)

A local-first, self-hosted backend where a user creates a **Shared Space**
(like a WhatsApp/Instagram group), adds members, and posts **Resources**
(text, images, PDFs, MP3, MP4, ZIP, etc). Members can **view / download /
stream / like** resources but cannot edit or delete someone else's post.

Think of it as a tiny, self-hosted Instagram feed per group:

```
Family Space
 ├── Jashu posts vacation.mp4   → everyone in the space sees it instantly
 ├── Ravi likes vacation.mp4    → like-count updates live for everyone
 └── Kiran posts notes.pdf      → shows up at the top of everyone's feed
```

## Everything runs locally — no external/cloud services

This project intentionally uses **only what runs on your own machine**:

| Concern            | Used here                              | NOT used             |
|---------------------|-----------------------------------------|-----------------------|
| Database            | PostgreSQL (local instance)             | ❌ AWS RDS, Supabase  |
| File storage         | Local disk (`/uploads` folder)          | ❌ S3 / R2 / Blob     |
| Real-time updates    | Plain Node.js `ws` WebSocket server     | ❌ Pusher, Firebase   |
| API docs             | Swagger (swagger-jsdoc + swagger-ui)    | ❌ Postman cloud      |
| Auth                 | JWT signed locally                      | ❌ Auth0, Clerk       |

Every table, every file, every socket connection lives on your machine.

## Tech stack

```
Node.js + Express.js
PostgreSQL (node-postgres "pg", raw SQL — no ORM)
JWT + bcrypt
Multer (local disk storage)
ws (WebSocket, for real-time feed/likes)
swagger-jsdoc + swagger-ui-express (MANDATORY, always on)
Joi (request validation)
Jest + Supertest (tests)
```

## Folder structure — each folder has its own README.md

```
src/
├── config/         → env, db pool, local storage path, swagger setup
├── controllers/     → req/res handlers, call services, stay thin
├── routes/           → Express routers + Swagger JSDoc annotations
├── services/         → business logic (incl. realtime.service.js)
├── middleware/       → auth, role checks, file upload, validation, errors
├── models/           → raw SQL query functions, one file per table
├── validators/       → Joi schemas
├── utils/             → jwt, password hashing, response shape, logger
└── constants/         → roles, resource types, permissions, socket events
migrations/            → plain SQL migration files, run in order
tests/                  → unit / integration / e2e
uploads/                → local disk storage for actual files (gitignored)
public/                  → a tiny plain HTML/JS demo UI (see below)
```

Open each folder's `README.md` before touching its code — it tells you
exactly what belongs there and what doesn't.

## Setup

```bash
git clone <your-repo>
cd shared-resource-platform
npm install
cp .env.example .env        # fill in your local Postgres creds + JWT secrets
psql -U postgres -f migrations/0001_init.sql
npm run dev
```

Then open:

- API base: `http://localhost:5000/api/v1`
- **Swagger docs**: `http://localhost:5000/api-docs`
- **Demo UI**: `http://localhost:5000/` (serves `public/index.html`)

## How the "Instagram-like" real-time feed works

Full explanation with diagrams lives in [`REALTIME.md`](./REALTIME.md).
Short version:

```
Space  = a group (like a private Instagram circle)
Member = a follower inside that group
Resource = a post
Like    = a like on that post

Jashu posts → Express saves post to Postgres
            → Express broadcasts "new_post" over WebSocket
            → every connected member's feed updates instantly, no refresh

Ravi likes  → Express saves like to Postgres
            → Express broadcasts "like_updated" over WebSocket
            → like count updates live for everyone watching that space
```

## Simple UI

`public/index.html` is a single plain HTML/CSS/JS file (no React, no build
step) that lets you log in, pick a space, see the live feed, post text, and
like posts — mainly so you can *see* the real-time behavior working without
Postman. See [`public/README.md`](./public/README.md).
