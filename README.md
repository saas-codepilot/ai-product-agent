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

See [system architecture](docs/architecture/system-architecture.md), [product specification](docs/product/product-spec.md), and [security notes](SECURITY.md).
