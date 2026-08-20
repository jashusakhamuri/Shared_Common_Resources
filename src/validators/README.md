# validators/

Joi schemas describing what a valid request body/params/query looks like.
`middleware/validation.middleware.js` runs these before the request ever
reaches a controller.

| File | Validates |
|---|---|
| `auth.validator.js` | register, login payloads |
| `sharedSpace.validator.js` | create/update space |
| `member.validator.js` | add member (email + role) |
| `resource.validator.js` | create text post, upload metadata |

### Example

```js
const createText = Joi.object({
  title: Joi.string().max(150).required(),
  content: Joi.string().max(20000).required(),
});
```

Keeping validation separate from controllers means the same schema can be
reused in tests and stays visible in one place instead of scattered `if`
statements.
