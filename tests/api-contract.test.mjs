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
test('OPTIONS preflight allows credentialed local requests', async () => {
  const source = await (await import('node:fs/promises')).readFile(new URL('../apps/api/src/server.ts', import.meta.url), 'utf8');
  assert.match(source, /'access-control-allow-origin':config\.webOrigin/);
  assert.match(source, /'access-control-allow-credentials':'true'/);
  assert.match(source, /'access-control-allow-methods':'GET,POST,PATCH,OPTIONS'/);
  assert.match(source, /'access-control-allow-headers':'content-type,x-user-id,x-workspace-id'/);
  assert.match(source, /req\.method==='OPTIONS'\)return json\(res,204/);
});
