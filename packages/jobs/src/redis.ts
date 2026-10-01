// @ts-ignore Optional production dependency is installed by the worker workspace.
import { Redis } from 'ioredis';
import { RedisJobQueue } from './index.ts';
export function createRedisJobQueue(url:string){const client=new Redis(url,{maxRetriesPerRequest:3,enableOfflineQueue:false});return {queue:new RedisJobQueue({command:(command:string,...args:string[])=>client.call(command,...args)}),client};}
