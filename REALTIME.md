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
