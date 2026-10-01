# Jobs

The API creates idempotent operation jobs and exposes workspace-scoped status through `/api/jobs/:id`. Local mode uses `InMemoryJobQueue`; production uses `RedisJobQueue` with ioredis, bounded retries, claims, and stale recovery. PostgreSQL `AppJob` provides the durable application record; Redis is the execution transport.

When PostgreSQL and Redis are configured, API dispatch first creates the workspace-scoped `AppJob`, then enqueues the same job ID into Redis. The worker updates the Prisma record on claim, completion, retry, and failure. Without those services, development deliberately uses the synchronous/in-memory path and reports that mode in health.

```mermaid
sequenceDiagram
  participant API
  participant DB as PostgreSQL
  participant R as Redis
  participant W as Worker
  participant S as Domain service
  participant P as Provider
  API->>DB: create job
  API->>R: enqueue idempotent job
  W->>R: claim + lease
  W->>S: execute handler
  S->>P: provider operation
  S->>DB: persist result and status
  W->>R: acknowledge completed job
```
