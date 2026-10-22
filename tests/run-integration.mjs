import { spawnSync } from 'node:child_process';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} exited with ${result.status}`);
}

if (spawnSync('docker', ['--version'], { stdio: 'ignore', shell: process.platform === 'win32' }).status !== 0) {
  console.error('integration lifecycle BLOCKED BY ENVIRONMENT: Docker is unavailable. Install Docker Desktop, then rerun pnpm test:integration:full.');
  process.exit(2);
}

let infraStarted = false;
try {
  run('docker', ['compose', 'up', '-d', 'postgres', 'redis']);
  infraStarted = true;
  run('pnpm', ['--filter', '@ai-product-agent/database', 'prisma:generate']);
  run('pnpm', ['--filter', '@ai-product-agent/database', 'exec', 'prisma', 'migrate', 'deploy'], { env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/ai_product_agent' } });
  run('node', ['tests/integration.mjs'], { env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/ai_product_agent', REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379' } });
} catch (error) {
  console.error(`integration lifecycle BLOCKED OR FAILED: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  if (infraStarted) spawnSync('docker', ['compose', 'down'], { stdio: 'inherit', shell: process.platform === 'win32' });
}
