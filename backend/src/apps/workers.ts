import { initializeRedis } from '../singletons/redis';

async function main() {
  // Initialize redis
  initializeRedis();
}

main();
