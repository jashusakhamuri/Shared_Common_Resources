# services/

All business logic lives here: SQL calls (through `models/`), permission
checks that go beyond a simple role check, and — importantly — the
**real-time broadcasting** that makes the feed feel like Instagram.

| File | Purpose |
|---|---|
| `auth.service.js` | hashing, token issuing/verifying, refresh rotation |
| `sharedSpace.service.js` | create/list/update/delete spaces |
| `member.service.js` | add/remove members, membership checks |
| `resource.service.js` | create text post, save uploaded file metadata, list feed |
| `storage.service.js` | reads/writes files on **local disk** (`uploads/`), builds the `storage_key` |
| `like.service.js` | toggle like, recompute like count |
| `realtime.service.js` | the "Instagram feels live" part — see below |
| `audit.service.js` | writes rows to `audit_logs` |

## `realtime.service.js` — how the live feed works

```js
async function publishNewResource(spaceId, resource) {
  await socket.broadcastToSpace(spaceId, {
    event: 'new_post',
    data: resource,
  });
}

async function publishLikeUpdate(spaceId, resourceId, likeCount) {
  await socket.broadcastToSpace(spaceId, {
    event: 'like_updated',
    data: { resourceId, likeCount },
  });
}
```

`resource.service.js` calls `publishNewResource` right after the INSERT
succeeds. `like.service.js` calls `publishLikeUpdate` the same way. This is
the entire "real-time" mechanism — no external pub/sub needed for a
single-server deployment. See root [`REALTIME.md`](../../REALTIME.md) for
the full picture and how to scale it later if you ever run multiple server
instances.
