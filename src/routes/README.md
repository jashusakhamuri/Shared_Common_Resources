# routes/

Plain `express.Router()` files. Each route file is mounted under
`/api/v1/...` in `app.js`. **Swagger is mandatory** — every route must carry
a JSDoc `@swagger` comment block directly above it so it shows up in
`/api-docs` automatically. Don't add an endpoint without one.

| File | Base path |
|---|---|
| `auth.routes.js` | `/api/v1/auth` |
| `user.routes.js` | `/api/v1/users` |
| `sharedSpace.routes.js` | `/api/v1/shared-spaces` |
| `member.routes.js` | `/api/v1/shared-spaces/:spaceId/members` |
| `resource.routes.js` | `/api/v1/shared-spaces/:spaceId/resources`, `/api/v1/resources/:id` |
| `like.routes.js` | `/api/v1/resources/:id/like` |

### Example — this is the pattern every route follows

```js
/**
 * @swagger
 * /shared-spaces/{spaceId}/resources:
 *   post:
 *     summary: Create a text resource (a "post") in a space
 *     tags: [Resources]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: spaceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *     responses:
 *       201: { description: Resource created }
 *       403: { description: Not a member / not allowed to post }
 */
router.post(
  '/:spaceId/resources',
  authMiddleware,
  authorizationMiddleware('OWNER'),
  validate(resourceValidator.createText),
  resourceController.createTextResource
);
```

Every protected route goes: `authMiddleware` → (optional)
`authorizationMiddleware` → `validate(...)` → controller.
