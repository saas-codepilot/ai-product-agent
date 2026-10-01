# Runtime

Use `pnpm dev:api`, `pnpm dev:web`, and `pnpm dev:worker` for local processes. `GET /api/health/live` checks process liveness; `/api/health/readiness` checks mode-appropriate PostgreSQL, Redis, storage, AI, and Shopify configuration. Production rejects missing PostgreSQL, Redis, OpenAI, encryption, or object-storage configuration.
