import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  reporter: process.env.CI ? 'line' : 'list',
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'retain-on-failure', serviceWorkers: 'block' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'tablet', use: { ...devices['iPad Mini'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: [
    { command: 'node tests/start-api.mjs', url: 'http://localhost:4000/api/health/live', reuseExistingServer: !process.env.CI, timeout: 30_000, stdout: 'pipe', stderr: 'pipe' },
    { command: 'pnpm --filter @ai-product-agent/web dev', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI, timeout: 30_000, stdout: 'pipe', stderr: 'pipe' },
  ],
});
