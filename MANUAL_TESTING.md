# Browser workflow and Milestone 11 QA record

## Automated/runtime execution record — 2026-10-01

- **PASS** API registration issued an `HttpOnly` session cookie; invalid login returned `401` without sensitive detail.
- **PASS** API logout invalidated the session; `/api/auth/me` returned `401` afterward.
- **PASS** API product creation and deterministic development AI analysis completed.
- **PASS** API no-match research state rendered correctly with the permitted Wikimedia provider returning zero candidates.
- **PASS** Workspace isolation returned `404` when Workspace B requested Workspace A’s product.
- **PASS** API Shopify development connection flow completed.
- **BLOCKED** Browser workflow — Next.js could not start because the Windows sandbox rejected child-process creation with `spawn EPERM`.
- **BLOCKED** Real PostgreSQL/Redis worker lifecycle — Docker is unavailable in the environment.
- **BLOCKED** Candidate confirmation, listing editor, media-worker variants, and publish result in the browser — dependent on the blocked web runtime and/or a real research candidate.

The checklist below is the exact human browser procedure. It is not marked complete by the automated API checks above.

## Startup commands

Development fallback (no Docker, PostgreSQL, or Redis):

```powershell
$env:DEV_AUTH_BYPASS="false"
$env:SHOPIFY_MODE="development"
pnpm dev:api
pnpm dev:web
```

Open `http://localhost:3000`. The API health endpoint is `http://localhost:4000/api/health`.

Persistent integration mode:

```powershell
pnpm infra:up
pnpm test:integration:full
pnpm dev:api
pnpm dev:worker
pnpm dev:web
```

Automated browser tests use real Playwright interactions and the web server command:

```powershell
pnpm test:e2e
```

The suite covers desktop, tablet, and mobile projects. It requires a working Next.js server and the Playwright browser binaries. `pnpm test:integration:full` exits with an explicit environment-blocked message when Docker is unavailable; it never reports a false pass.

## Test categories

- **MANUAL:** the browser checklist below, to be run by a human when the web runtime is available.
- **AUTOMATED BROWSER E2E:** `pnpm test:e2e`, using Playwright and accessible browser controls.
- **API/UNIT:** TypeScript checks, contract tests, and API fallback smoke checks.
- **DATABASE/REDIS INTEGRATION:** `pnpm test:integration:full`, requiring Docker Desktop.

# Milestone 10 browser workflow

Run the API and web app in development mode. Use a development Shopify store when testing publishing. Each checkbox is intentionally left unchecked until a human completes the action in a browser.

1. [ ] Register — open the app, choose “Create one”, enter a valid email and a 12+ character password. Expected: an authenticated workspace opens.
2. [ ] Login — log out, enter the same credentials, and submit. Expected: the dashboard opens without exposing credentials in the URL or local storage.
3. [ ] Create product — choose “Create product”. Expected: the upload workflow is visible with clear requirements.
4. [ ] Upload product images — add 1–5 JPEG, PNG, or WebP images, including one invalid/oversized file as a negative check. Expected: invalid files are rejected with a useful message and valid files preview safely.
5. [ ] Analyze — start “Analyze and research”. Expected: the UI shows processing states and returns analysis data or a safe error.
6. [ ] Research — wait for permitted research to finish. Expected: candidates show source, links, confidence, signals, and evidence.
7. [ ] Review candidates — expand evidence and specifications, then choose a candidate. Expected: no candidate is silently treated as confirmed.
8. [ ] Confirm product — click “This is my product”. Expected: a listing is generated only after explicit confirmation.
9. [ ] Generate listing — open Listing editor. Expected: all supported listing fields are present with the actual backend values.
10. [ ] Edit field — edit and save Title. Expected: a success message appears and the value persists after refresh.
11. [ ] Regenerate one field — regenerate Title with one direction. Expected: only Title changes; description, bullets, SEO, social, and ad fields remain unchanged.
12. [ ] Verify unrelated fields — refresh the product and compare unrelated fields. Expected: persistence is intact and no unrelated field was regenerated.
13. [ ] Process media — inspect Product assets. Expected: originals are shown as protected; optimized/thumbnail variants are shown when media processing is enabled.
14. [ ] Connect Shopify development mode — open the Shopify tab and connect `demo.myshopify.com`. Expected: a development connection is shown.
15. [ ] Preview — load the Shopify preview. Expected: title, description, bullets, vendor, type, tags, and SEO mapping are visible before publishing.
16. [ ] Explicitly publish — click “Publish to Shopify”. Expected: publishing requires this separate action and shows a safe result or job state.
17. [ ] Inspect job history — open Job center. Expected: operation, status, timestamps, and attempts are visible without secrets.
18. [ ] Logout/login again — log out and log in. Expected: the session behavior is clear and the protected dashboard cannot be accessed while logged out.
19. [ ] Verify persistence — reopen the product and listing. Expected: product, evidence, edits, and publish state remain workspace-scoped and persisted when the configured database is running.

Record failures with the browser, API mode, product/job ID, and a screenshot. Do not paste tokens, cookies, or credentials into an issue.
