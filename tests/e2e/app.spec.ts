import { test, expect, type Page } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const fixture = join(process.cwd(), 'tests', 'e2e', 'fixtures', 'product.png');
mkdirSync(join(process.cwd(), 'tests', 'e2e', 'fixtures'), { recursive: true });
writeFileSync(fixture, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'));

async function register(page: Page, workspace = `qa-${Date.now()}-${Math.random().toString(36).slice(2)}`) {
  const email = `${workspace}@example.test`;
  await page.goto('/');
  await page.getByRole('button', { name: /create one/i }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('correct horse battery staple');
  await page.getByRole('button', { name: /create account/i }).click();
  await expect(page.getByRole('heading', { name: /good to see you/i })).toBeVisible();
  return { email, password: 'correct horse battery staple' };
}

test.describe('real browser development fallback workflow', () => {
  test('registration, dashboard navigation, and protected logout', async ({ page }) => {
    await register(page);
    await expect(page.getByRole('button', { name: 'Products' })).toBeVisible();
    await page.getByRole('button', { name: 'Jobs' }).click();
    await expect(page.getByRole('heading', { name: 'Job center' })).toBeVisible();
    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('upload validation and product creation screen', async ({ page }) => {
    await register(page);
    await page.getByRole('button', { name: /create product/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Create a product' })).toBeVisible();
    await page.locator('input[type=file]').setInputFiles(fixture);
    await expect(page.getByText('1/5 selected')).toBeVisible();
    await expect(page.getByRole('button', { name: /analyze and research/i })).toBeEnabled();
    await page.getByRole('button', { name: /remove product.png/i }).click();
    await expect(page.getByText('0/5 selected')).toBeVisible();
  });

  test('development analysis and research state are rendered', async ({ page }) => {
    await register(page);
    await page.getByRole('button', { name: /create product/i }).first().click();
    await page.locator('input[type=file]').setInputFiles(fixture);
    await page.getByRole('button', { name: /analyze and research/i }).click();
    await expect(page.getByText(/creating product|analyzing images|researching permitted sources/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /what we can see|evidence-backed candidates/i })).toBeVisible({ timeout: 30_000 });
  });

  test('responsive navigation remains usable', async ({ page }) => {
    await register(page);
    await page.getByRole('button', { name: 'Products' }).click();
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    await page.getByRole('button', { name: 'Integrations' }).click();
    await expect(page.getByRole('heading', { name: 'Integrations' })).toBeVisible();
  });
});
