# AI Product Agent — developer handoff

## Scope and current priority

This repository is an AI-assisted product research and Shopify listing workflow. The immediate priority is deliberately narrower than a complete SaaS: upload a real product image, discover genuinely related real products through permitted sources, and show reliable listings with source links and attribution. The next developer must validate actual provider responses before describing discovery as working.

The working tree contains substantial uncommitted implementation from earlier milestones. Preserve it. Do not reset, clean, or overwrite it without inspecting the diff first.

Current Git state at handoff:

- Branch: `main`
- HEAD and `origin/main`: `684d530`
- Remote: `https://github.com/saas-codepilot/ai-product-agent.git`
- Working tree: intentionally dirty with research, visual matching, URL validation, persistence, API/web, migration, and test changes.

## Architecture

- `apps/web` — Next.js dashboard and upload/research/listing workflow. It sends image data to the API for analysis and research, displays provider states and candidates, and supports confirmation plus whole-listing or individual-field rewriting.
- `apps/api` — Node/TypeScript HTTP API. It owns workspace-scoped routes, auth checks, product analysis, research orchestration, candidate persistence, listing generation, URL metadata import, health/readiness, and Shopify boundaries.
- `apps/worker` — background job entry point and handlers for Redis-backed runtime jobs. Local development can use the API's synchronous/in-memory path.
- `services/product-research` — `ResearchProvider` interface, provider registry, query generation, multi-provider orchestration, deduplication, clue ranking, provider capability metadata, and optional local image ranking.
- `packages/ai` — AI provider port. OpenAI is credential-gated; the development fallback only extracts conservative image/pixel or filename clues and is not semantic product recognition.
- `packages/media` — Sharp-based image validation and RGB pixel embeddings used only for local similarity ranking.
- `packages/database` — Prisma schema/migrations and memory/PostgreSQL repositories. PostgreSQL is required for persistent local data; absent `DATABASE_URL` selects the explicit development memory repository.
- `packages/types`, `packages/validation`, `packages/auth`, `packages/security`, `packages/jobs`, and `packages/shopify` — shared contracts, URL/security validation, local auth/session support, job abstractions, and explicit Shopify integration boundaries.

## Windows setup and commands

Requirements currently available in this environment: Node `v24.22.1`, Corepack pnpm `11.19.0`. Docker is not installed.

From PowerShell:

```powershell
cd C:\Users\devil\Documents\Saas\ai-product-agent
corepack pnpm install
Copy-Item .env.example .env
# Edit .env only with local values; never commit it.
corepack pnpm dev:api
corepack pnpm dev:web
```

The local development fallback listens on `http://localhost:4000` (API) and `http://localhost:3000` (web). For the no-credentials UI flow, set `DEV_AUTH_BYPASS=true` and `SHOPIFY_MODE=development`; use `DEV_AUTH_BYPASS=false` to exercise registration/login. The repository also contains an untracked `.local-bin\pnpm.cmd` wrapper that runs `corepack pnpm`; keep it untracked.

Useful commands:

```powershell
corepack pnpm test
corepack pnpm typecheck
corepack pnpm test:e2e
corepack pnpm runtime:check
```

`corepack pnpm dev` starts API and web in parallel, but separate terminals are easier to diagnose on Windows. `corepack pnpm dev:worker` is needed when testing the persistent Redis job path.

The persistent path requires a separately installed PostgreSQL and Redis, or Docker Desktop:

```powershell
corepack pnpm infra:up
corepack pnpm --filter @ai-product-agent/database prisma:generate
corepack pnpm --filter @ai-product-agent/database prisma:migrate
corepack pnpm dev:api
corepack pnpm dev:worker
corepack pnpm dev:web
corepack pnpm test:integration:full
```

Do not claim persistent infrastructure is verified here: Docker was unavailable at handoff. The current Windows Codex sandbox also rejects child-process creation with `spawn EPERM`, which can prevent Next.js, Playwright, and pnpm recursive scripts from starting even when direct TypeScript checks work.

## Environment configuration

Copy `.env.example` to an untracked `.env`. The example contains no real credentials. Core local settings are `API_PORT`, `WEB_ORIGIN`, `DEV_AUTH_BYPASS`, `SHOPIFY_MODE`, `DATABASE_URL`, `REDIS_URL`, and `STORAGE_ROOT`.

Provider configuration is important:

- The actual config default is `RESEARCH_PROVIDER=ebay`.
- eBay requires both `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET`; neither is present in the current environment. It must not be treated as live or configured without them.
- `RESEARCH_PROVIDER=printful` uses the official Printful catalog without a credential, but Printful is a print-on-demand supplier catalog, not a general marketplace and not a verified shaver-search solution.
- `RESEARCH_PROVIDER=openfoodfacts` uses a public food-only API and requires the descriptive `OPENFOODFACTS_USER_AGENT` value; it is not a general product source.
- `RESEARCH_PROVIDER=wikimedia` or `wikipedia` uses public reference/media APIs, not commercial marketplace discovery.
- `RESEARCH_PROVIDER=development` is an empty deterministic fallback for local tests.
- `OPENAI_API_KEY` is optional in development and absent here. Without it, the AI fallback is not semantic vision.
- Real Shopify OAuth needs the Shopify client variables and encryption configuration. `SHOPIFY_MODE=development` is only a local mock.
- Production additionally requires persistent database/Redis, object storage, auth without bypass, and encryption configuration; production deployment is out of scope.

`.gitignore` currently excludes `node_modules/`, `.next/`, `dist/`, coverage and test output, real `.env` files, logs, `.local-bin/`, `.pnpm-store/`, and `*.tsbuildinfo`. Keep generated files, local stores, dependencies, credentials, tokens, and customer images untracked. Review `git status` before any handoff commit.

## Implemented and validated

Implemented areas in the current dirty tree include:

- workspace-scoped product/auth API and image upload flow;
- AI analysis port with a credential-gated OpenAI adapter and honest development fallback;
- provider capability metadata and statuses for configured, unavailable, and not-configured sources;
- multi-provider text query generation, provider isolation, partial-success reporting, candidate deduplication, provenance/evidence, and local RGB pixel similarity ranking;
- optional eBay, Printful, Open Food Facts, Wikimedia, and Wikipedia adapters, subject to their stated coverage and access limits;
- candidate confirmation, persisted listing fields, whole-listing and individual-field rewriting;
- URL import validation with private-host, redirect, timeout, and response-size protections;
- Prisma schema/migration work and development memory fallbacks;
- focused contract, provider, persistence, URL, security, and visual-ranking tests.

Checks executed for this handoff:

- `corepack pnpm test` — PASS; contract tests passed. A non-fatal Node module-type warning is emitted for the frontend helper imported by the test.
- Direct API, worker, and web TypeScript checks with the repository's installed TypeScript compiler — PASS.
- `git diff --check` — PASS; Git reported only Windows LF/CRLF normalization warnings.
- `corepack pnpm typecheck` — BLOCKED by the environment's Windows `spawn EPERM` while pnpm launched recursive package checks.
- Docker availability — BLOCKED; `docker` is not installed.
- Live commercial discovery — NOT VERIFIED. No eBay credentials are configured. A bounded Printful request previously returned HTTP 200 with a catalog item, but that does not verify general product discovery or an electric-shaver match.

## Known limitations and risks

- There is no verified, credential-free, general commercial reverse-image search provider in this repository.
- Uploaded image bytes do not currently perform provider-side image discovery. They are used for AI input when configured and for post-discovery Sharp RGB pixel similarity; that is not semantic recognition or reverse-image search.
- The research query path is text-based and only as useful as the persisted clues and provider coverage. A legitimate empty response is not a provider outage.
- eBay is the closest general marketplace adapter but remains unverified until credentials and permitted API access are available.
- Printful, Open Food Facts, Wikimedia, and Wikipedia must not be presented as a general marketplace substitute.
- PostgreSQL/Redis persistence, worker delivery, browser E2E, and the complete upload-to-real-listing flow remain environment-dependent and are not all verified in this handoff environment.
- `README.md` contains older wording that describes Wikimedia as the default research adapter, while the current config default is eBay. Treat the code and `/api/health` capability response as authoritative until that documentation is reconciled.
- Existing uncommitted files may include generated artifacts or work from earlier milestones. Review ownership and diffs before staging anything.

## Exact next task

Investigate and implement the best legitimate free image-to-web product discovery path that is permitted and actually accessible. Start by checking official API/catalog terms and the current provider contract. Validate with a real test image, record the exact HTTP/provider result, preserve canonical source links and attribution, and report whether the provider performed image search, text search, or only local ranking. Do not scrape restricted storefronts, bypass bot protection, fabricate listings, or claim success without a real returned result.

## Safe Git handoff commands

These commands inspect and preserve the current work; they do not discard changes:

```powershell
git status --short --branch
git diff --stat
git diff --check
git diff -- .gitignore .env.example HANDOFF.md
git remote -v
git log -1 --oneline
```

Before a future milestone commit, inspect the complete diff and untracked files, confirm no `.env`, token, customer image, generated store, or build artifact is included, then stage only the intended files. Do not run `git reset --hard`, broad cleanup, or push until the receiving developer has reviewed the inherited changes.
