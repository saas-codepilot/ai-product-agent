declare const process:any;
import { config } from '../../../packages/config/src/index.ts';
import { createRedisJobQueue } from '../../../packages/jobs/src/redis.ts';
import { WorkerRuntime } from '../../../packages/jobs/src/worker.ts';
if(!config.redisUrl)throw new Error('REDIS_URL is required for the worker.');
const {queue,client}=createRedisJobQueue(config.redisUrl);
const worker=new WorkerRuntime(queue,{ 'ai.visual-analysis':async()=>{}, 'ai.listing-generation':async()=>{}, 'ai.field-regeneration':async()=>{}, 'research.product':async()=>{}, 'media.process':async()=>{}, 'shopify.publish':async()=>{} },`worker-${process.pid}`);
let stopping=false;const shutdown=async()=>{if(stopping)return;stopping=true;await worker.shutdown();await client.quit();process.exit(0);};process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);console.log('Worker started.');await worker.start();
