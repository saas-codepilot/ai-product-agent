# Runtime and test infrastructure

## Development fallback

The API runs on `http://localhost:4000` and the Next.js app on `http://localhost:3000`. Without `DATABASE_URL` or `REDIS_URL`, the API uses its explicit in-memory development repositories and synchronous operation path. This mode is useful for API smoke checks but does not validate persistence or worker delivery.

Start the fallback with:

```powershell
$env:DEV_AUTH_BYPASS="false"
$env:SHOPIFY_MODE="development"
pnpm dev:api
pnpm dev:web
```

## Browser E2E

`pnpm test:e2e` runs `tests/e2e/app.spec.ts` through Playwright on desktop, tablet, and mobile projects. Playwright starts `tests/start-api.mjs` and the web server automatically. Tests use real browser controls and uploads; they do not replace browser behavior with API calls.

## Persistent integration

`pnpm test:integration:full` starts the PostgreSQL and Redis services from `docker-compose.yml`, applies Prisma migrations, and runs the real infrastructure smoke test. It exits with status 2 and an explicit `BLOCKED BY ENVIRONMENT` message when Docker is unavailable. It never treats the in-memory fallback as persistent integration.

## Known environment limitation

In the current Windows Codex sandbox, even a minimal `child_process.spawnSync(process.execPath, ...)` returns `EPERM`. Next.js, pnpm recursive scripts, and Playwright therefore cannot launch child processes. This is an environment restriction, not a repository-level Next.js configuration issue. No security controls or OS settings are changed by the project to work around it.
