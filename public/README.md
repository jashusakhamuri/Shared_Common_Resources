# public/

A single plain HTML/CSS/JS file — no React, no build step, no npm install
needed for the UI itself. Express serves it directly at `/`.

`index.html` lets you:

- Register / log in (stores the JWT in memory)
- Pick or create a shared space
- See the feed of that space (text posts, images, video, audio, other files)
- Post a new text resource, or upload a file
- Like / unlike a post
- Watch the feed and like-counts **update live** via the WebSocket, without
  refreshing — open the same page in two browser tabs logged in as two
  different members to see it happen.

## How media playback works

`<video>`, `<audio>`, and `<img>` tags can't send a custom `Authorization`
header, so they can't call the API the same way `fetch()` does. To let the
browser stream files **natively** (proper seeking, no loading the whole
file into memory in JavaScript first), the demo UI points those tags
straight at:

```
/api/v1/resources/:id/stream?token=<the JWT>
```

`middleware/auth.middleware.js` accepts the token from either the
`Authorization` header (used by all the JSON API calls) or this `?token=`
query param (used only by media tags) — see the comment there. This is the
standard, simple way to let native HTML media elements hit an authenticated
endpoint.

It's meant as a demo / manual test tool, not a production frontend.

