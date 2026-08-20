# controllers/

Controllers only do three things:

1. Read `req` (params, body, query, `req.user` from the auth middleware)
2. Call a **service** function to do the actual work
3. Send a response with `utils/response.js`

They contain **no SQL** and **no business rules** ("is this user allowed to
delete this?" lives in `services/` or `middleware/authorization.middleware.js`,
never here).

| File | Handles |
|---|---|
| `auth.controller.js` | register, login, refresh, logout |
| `user.controller.js` | get/update own profile |
| `sharedSpace.controller.js` | create/list/get/update/delete a space |
| `member.controller.js` | add/list/remove members of a space |
| `resource.controller.js` | create text post, upload file, list, view, download, stream |
| `like.controller.js` | like / unlike a resource, get like count |

### Example shape

```js
// resource.controller.js
async function createTextResource(req, res, next) {
  try {
    const resource = await resourceService.createText({
      spaceId: req.params.spaceId,
      userId: req.user.id,
      ...req.body,
    });
    return response.success(res, 201, resource);
  } catch (err) {
    next(err); // handled by middleware/error.middleware.js
  }
}
```

If a controller function is longer than ~15 lines, that logic almost
certainly belongs in `services/` instead.
