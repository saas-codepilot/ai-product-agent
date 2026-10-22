# AI Product Agent

AI-powered product research and Shopify listing automation. The current milestone is a dependency-light, local MVP foundation: image metadata ingestion, evidence-aware research candidates, field-level listing editing/regeneration, and an explicit Shopify connection boundary.

## Run locally

```bash
pnpm install
pnpm dev
```

The API runs on `http://localhost:4000` and the web app on `http://localhost:3000`. Without `DATABASE_URL`, the API uses an explicit development-only memory repository; with PostgreSQL configured it switches to Prisma persistence. Production startup rejects missing `DATABASE_URL`, enabled auth bypass, or missing `OPENAI_API_KEY`. The default research adapter is Wikimedia Commons, a public no-key source, and returns only normalized source-backed media results.

## PostgreSQL

Install PostgreSQL locally, create `ai_product_agent`, copy `.env.example` to `.env`, set `DATABASE_URL`, then run:

```bash
pnpm --filter @ai-product-agent/database prisma:generate
pnpm --filter @ai-product-agent/database prisma:migrate
```

The API then reports `storage: postgres` from `/api/health`. `DEV_AUTH_BYPASS=true` is for local development only; production must provide authenticated `x-user-id` and `x-workspace-id` through a real session layer.

## Quality checks

```bash
pnpm test
pnpm typecheck
```

Shopify uses the Admin GraphQL API behind a server-side provider boundary. Set `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, and `SHOPIFY_REDIRECT_URI` for a real app. For local end-to-end flow only, `SHOPIFY_MODE=development` enables a non-network mock provider; it never represents a production store. OAuth state, shop validation, workspace ownership, preview, explicit publish, and idempotency are enforced by the API. Tokens are never returned to the browser.

See [system architecture](docs/architecture/system-architecture.md), [research engine](docs/architecture/research-engine.md), [Shopify integration](docs/architecture/shopify-integration.md), [publishing pipeline](docs/architecture/publishing-pipeline.md), [product specification](docs/product/product-spec.md), and [security notes](SECURITY.md).

Local auth endpoints are `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, and `/api/auth/logout`. Set `DATABASE_URL` and run Prisma migrations for persistent data. The local job, media, and session ports are deterministic fallbacks; use Redis/object storage and a persistent session store before a production deployment.

Milestone 6 adds `GET /api/health/live` and `GET /api/health/readiness`. Production requires `REDIS_URL` and `SHOPIFY_ENCRYPTION_KEY`; local development may use the in-memory queue, local storage, and development Shopify mode. The worker queue and storage interfaces are documented in [job system](docs/architecture/job-system.md), [worker runtime](docs/architecture/worker-runtime.md), and [storage](docs/architecture/storage.md).

For the persistent local runtime, run `docker compose up -d postgres redis`, set the example `DATABASE_URL` and `REDIS_URL`, run `pnpm --filter @ai-product-agent/database prisma:generate` followed by `pnpm --filter @ai-product-agent/database prisma:migrate`, then start `pnpm dev:api` and `pnpm dev:worker`. Run `pnpm test:integration` to verify the integration environment variables are present. Stop infrastructure with `docker compose down`.
## Runtime and browser tests

The development fallback runs the API on `http://localhost:4000` and the Next.js web app on `http://localhost:3000` without PostgreSQL or Redis. Start them with `pnpm dev:api` and `pnpm dev:web` (set `DEV_AUTH_BYPASS=false` to exercise registration/login). Run real browser tests with `pnpm test:e2e`; Playwright starts the web server and covers desktop, tablet, and mobile projects. The persistent lifecycle command is `pnpm test:integration:full`, which starts Docker Compose, applies Prisma migrations, runs PostgreSQL/Redis checks, and exits explicitly as environment-blocked if Docker is unavailable.
