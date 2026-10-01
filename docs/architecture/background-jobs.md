# Background jobs

`@ai-product-agent/jobs` defines stable operation keys and the states queued, processing, retrying, completed, failed, and cancelled. The in-memory queue is deterministic for local tests and de-duplicates active/completed work by key. PostgreSQL already persists research job state; the next deployment step is wiring this port to Redis and a worker process. Expensive provider calls must run through the job port before production rollout.
