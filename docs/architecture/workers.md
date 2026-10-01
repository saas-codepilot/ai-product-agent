# Workers

`apps/worker` is a separate runtime. It requires `REDIS_URL`, claims jobs, dispatches AI/research/media/Shopify operation types, updates terminal state, and shuts down on SIGINT/SIGTERM after active work drains. Production should run it independently from the API process.

The handlers load the workspace-scoped repository, call the existing AI/research/media/Shopify provider ports, and persist results. Local API mode intentionally keeps its synchronous fallback when Redis is not configured.
