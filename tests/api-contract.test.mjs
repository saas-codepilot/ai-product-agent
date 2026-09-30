import test from 'node:test';
import assert from 'node:assert/strict';
test('MVP contract keeps publishing explicit', async () => {
  const source = await (await import('node:fs/promises')).readFile(new URL('../apps/api/src/server.ts', import.meta.url), 'utf8');
  assert.match(source, /shopify\/connect/);
  assert.match(source, /explicit|configured/);
});
test('secrets are excluded from git', async () => {
  const source = await (await import('node:fs/promises')).readFile(new URL('../.gitignore', import.meta.url), 'utf8');
  assert.match(source, /\.env/);
});
