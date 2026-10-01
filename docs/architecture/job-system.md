# Job system

Jobs have stable idempotency keys and explicit queued, processing, retrying, completed, failed, and cancelled states. `InMemoryJobQueue` remains useful for tests. `RedisJobQueue` uses a Redis command client boundary, persists job payloads, claims work from a queue, and supports stale-lease recovery. Production configuration requires `REDIS_URL`; there is no silent production fallback to memory.
