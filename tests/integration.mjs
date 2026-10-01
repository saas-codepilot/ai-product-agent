const required=['DATABASE_URL','REDIS_URL'];
const missing=required.filter(name=>!process.env[name]);
if(missing.length){console.log(`integration tests BLOCKED BY ENVIRONMENT: set ${missing.join(', ')}`);process.exit(0);}

const { PrismaClient } = await import('../packages/database/node_modules/@prisma/client/default.js');
const { Redis } = await import('../packages/jobs/node_modules/ioredis/built/index.js');
const prisma=new PrismaClient();
const redis=new Redis(process.env.REDIS_URL);
try {
  await prisma.$queryRaw`SELECT 1`;
  const migration=await prisma.$queryRaw`SELECT to_regclass('"AppJob"') AS app_job, to_regclass('"PublishAttempt"') AS publish_attempt`;
  if(!migration[0]?.app_job||!migration[0]?.publish_attempt) throw new Error('Prisma migrations are not applied');
  const key=`ai-product-agent:integration:${Date.now()}`;
  await redis.set(key,'ok','EX',30);
  if(await redis.get(key)!=='ok') throw new Error('Redis round-trip failed');
  const queue=`${key}:queue`;
  await redis.lpush(queue,'job-1');
  if(await redis.rpop(queue)!=='job-1') throw new Error('Redis queue round-trip failed');
  console.log('integration infrastructure PASSED: PostgreSQL migrated and Redis enqueue/claim smoke verified');
} finally {
  await redis.quit();
  await prisma.$disconnect();
}
