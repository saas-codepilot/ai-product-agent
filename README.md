# AI Product Agent

AI-powered product research and Shopify listing automation. The current milestone is a dependency-light, local MVP foundation: image metadata ingestion, evidence-aware research candidates, field-level listing editing/regeneration, and an explicit Shopify connection boundary.

## Run locally

```bash
pnpm install
pnpm dev
```

The API runs on `http://localhost:4000` and the web app on `http://localhost:3000`. The development API intentionally uses an in-memory store and a deterministic research provider until database, AI, storage, and Shopify credentials are configured.

## Quality checks

```bash
pnpm test
pnpm typecheck
```

See [system architecture](docs/architecture/system-architecture.md), [product specification](docs/product/product-spec.md), and [security notes](SECURITY.md).
