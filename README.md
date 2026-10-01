# AI Product Agent

AI-powered product research and Shopify listing automation. The current milestone is a dependency-light, local MVP foundation: image metadata ingestion, evidence-aware research candidates, field-level listing editing/regeneration, and an explicit Shopify connection boundary.

## Run locally

```bash
pnpm install
pnpm dev
```

The API runs on `http://localhost:4000` and the web app on `http://localhost:3000`. Without `DATABASE_URL`, the API uses an explicit development-only memory repository; with PostgreSQL configured it switches to Prisma persistence. The default research adapter is Wikimedia Commons, a public no-key source, and returns only normalized source-backed media results.

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
