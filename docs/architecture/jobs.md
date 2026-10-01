# Jobs

The API creates idempotent operation jobs and exposes workspace-scoped status through `/api/jobs/:id`. Local mode uses `InMemoryJobQueue`; production uses `RedisJobQueue` with ioredis, bounded retries, claims, and stale recovery. PostgreSQL `AppJob` provides the durable application record; Redis is the execution transport.
