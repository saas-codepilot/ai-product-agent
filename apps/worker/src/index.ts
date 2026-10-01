declare const process:any;
import { config } from '../../../packages/config/src/index.ts';
import { createRedisJobQueue } from '../../../packages/jobs/src/redis.ts';
import { WorkerRuntime } from '../../../packages/jobs/src/worker.ts';
import { createHandlers } from './handlers.ts';
if(!config.redisUrl)throw new Error('REDIS_URL is required for the worker.');
const {queue,client}=createRedisJobQueue(config.redisUrl);
const worker=new WorkerRuntime(queue,createHandlers(),`worker-${process.pid}`);
let stopping=false;const shutdown=async()=>{if(stopping)return;stopping=true;await worker.shutdown();await client.quit();process.exit(0);};process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);console.log('Worker started.');await worker.start();
