# tests/

```
unit/           → pure functions: utils, services with DB calls mocked
integration/    → controllers + real test Postgres DB, no HTTP server
e2e/            → supertest hitting the actual Express app end-to-end
```

Run with:

```bash
npm test
```

Suggested minimum coverage before you deploy:
- register/login/refresh flow
- creating a space + adding a member
- a `VIEWER` getting a 403 when trying to upload/delete
- posting a resource → it appears in another member's feed
- liking a resource twice → count only increases once (toggle, not stack)
