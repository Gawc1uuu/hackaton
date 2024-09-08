import IORedis from 'ioredis';

export let redisConnection: IORedis | null = null;

export function initializeRedis() {
  redisConnection = new IORedis(6379, {
    host: 'localhost',
    maxRetriesPerRequest: null,
  });
}
