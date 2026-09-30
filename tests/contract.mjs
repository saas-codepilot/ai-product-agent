import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const api=await readFile(new URL('../apps/api/src/server.ts',import.meta.url),'utf8');
const schema=await readFile(new URL('../packages/database/prisma/schema.prisma',import.meta.url),'utf8');
const ignore=await readFile(new URL('../.gitignore',import.meta.url),'utf8');
assert.match(api,/AUTH_REQUIRED/); assert.match(api,/workspaceId/); assert.match(api,/SHOPIFY_NOT_CONFIGURED/);
assert.match(schema,/model ResearchJob/); assert.match(schema,/model AuditLog/); assert.match(schema,/@@unique\(\[listingId, name\]\)/);
assert.match(ignore,/\.env/);
console.log('contract tests passed');
