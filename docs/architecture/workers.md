# Workers

`apps/worker` is a separate runtime. It requires `REDIS_URL`, claims jobs, dispatches AI/research/media/Shopify operation types, updates terminal state, and shuts down on SIGINT/SIGTERM after active work drains. Production should run it independently from the API process.
