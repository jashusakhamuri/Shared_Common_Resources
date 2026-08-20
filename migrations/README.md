# migrations/

Plain, numbered SQL files run in order against your **local** PostgreSQL
instance. No migration framework required for a project this size — just
run them with `psql`.

| File | Adds |
|---|---|
| `0001_init.sql` | `users`, `shared_spaces`, `space_members`, `resources`, `resource_likes`, `audit_logs` |

## Running migrations

```bash
psql -U postgres -d your_db -f migrations/0001_init.sql
```

When you need a schema change, add a new file: `0002_add_something.sql` —
never edit an already-applied migration file, add a new one instead so the
history stays honest.
