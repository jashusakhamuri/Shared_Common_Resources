# models/

No ORM. Each file is a thin wrapper of parameterized SQL queries against the
shared `pg.Pool` from `config/db.js`. One file per table.

| File | Table |
|---|---|
| `user.model.js` | `users` |
| `sharedSpace.model.js` | `shared_spaces` |
| `member.model.js` | `space_members` |
| `resource.model.js` | `resources` |
| `like.model.js` | `resource_likes` |
| `auditLog.model.js` | `audit_logs` |

### Example

```js
// resource.model.js
async function findFeedBySpace(spaceId, { limit = 20, offset = 0 } = {}) {
  const { rows } = await pool.query(
    `SELECT r.*, u.full_name AS posted_by,
            COUNT(l.id) AS like_count
     FROM resources r
     JOIN users u ON u.id = r.uploaded_by
     LEFT JOIN resource_likes l ON l.resource_id = r.id
     WHERE r.space_id = $1 AND r.is_deleted = FALSE
     GROUP BY r.id, u.full_name
     ORDER BY r.created_at DESC
     LIMIT $2 OFFSET $3`,
    [spaceId, limit, offset]
  );
  return rows;
}
```

## Rule
**Always** use `$1, $2, ...` parameterized placeholders — never string-concat
user input into SQL. This is what prevents SQL injection.
