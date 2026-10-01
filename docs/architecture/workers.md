# Workers

`apps/worker` is a separate runtime. It requires `REDIS_URL`, claims jobs, dispatches AI/research/media/Shopify operation types, updates the matching Prisma `AppJob` transition, and shuts down on SIGINT/SIGTERM after active work drains. A lease is recorded when a worker claims a job; stale processing jobs can be recovered to `retrying` by the repository. Production should run it independently from the API process.

The handlers load the workspace-scoped repository, call the existing AI/research/media/Shopify provider ports, and persist results. Shopify handlers also create/update a workspace-scoped `PublishAttempt` linked to the `AppJob`; provider tokens are never copied into job or attempt metadata. Local API mode intentionally keeps its synchronous fallback when Redis is not configured.
