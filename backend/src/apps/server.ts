import express from 'express';
import { createServer } from 'http';

import { initializeRedis } from '../singletons/redis';
import { BullMQSingleton } from '../singletons/BullMq';
import { initSocketIoServer, socketIoServer } from '../singletons/sockeio';
import { QUEUES } from '../singletons/BullMq/constants';

import { checkHealth } from '../handlers/http/health';
import { handleConnectionWithServer } from '../handlers/socket/connection';
import { handleRegistrationJob } from '../workers/registration';
import { handleTradeStart } from '../workers/trade';

import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import basicAuth from 'express-basic-auth';

import * as dotenv from 'dotenv';

async function main() {
  // Load environment variables
  dotenv.config();
  // Initialize redis
  initializeRedis();

  // Initialize the server
  const app = express();
  const httpServer = createServer(app);
  initSocketIoServer(httpServer);

  // Register socket handlers
  socketIoServer.on('connection', handleConnectionWithServer);

  // Register queues
  BullMQSingleton.getInstance().createQueue(QUEUES.REGISTRATION, handleRegistrationJob);
  BullMQSingleton.getInstance().createQueue(QUEUES.TRADES, handleTradeStart);

  // Expore bullmq dashboard
  const BULLMQ_PATH = '/bullmq';
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(BULLMQ_PATH);
  createBullBoard({
    queues: BullMQSingleton.getInstance()
      .getAllQueues()
      .map((queue) => new BullMQAdapter(queue)),
    serverAdapter,
  });
  app.use(BULLMQ_PATH, serverAdapter.getRouter());

  // Setup express
  app.use(express.json());

  // Register routes
  app.get('/health', checkHealth);
  // Start the server
  const port = process.env.PORT || 3000;

  httpServer.listen(port, () => {
    console.log(`Server started successfully, listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

