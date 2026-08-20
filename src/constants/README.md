# constants/

Fixed, shared values so nothing is a "magic string" scattered around the
codebase.

| File | Contains |
|---|---|
| `roles.js` | `{ OWNER: 'OWNER', VIEWER: 'VIEWER' }` |
| `resourceTypes.js` | `{ TEXT, IMAGE, VIDEO, AUDIO, DOCUMENT, ARCHIVE, OTHER }` |
| `permissions.js` | which roles can do what (used by `authorization.middleware.js`) |
| `socketEvents.js` | `{ NEW_POST: 'new_post', LIKE_UPDATED: 'like_updated', MEMBER_JOINED: 'member_joined' }` — the event names both the backend and `public/index.html` agree on |

Import from here instead of typing `'OWNER'` or `'new_post'` by hand in
multiple files.
