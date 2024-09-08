import { Job, Processor } from 'bullmq';
import { QUEUES, QUEUE_WORKERS_DEF } from '../../singletons/BullMq/constants';
import { SpeedyCache } from '../../singletons/redis/speedy-cache';
import { socketIoServer } from '../../singletons/sockeio';
import { SocketConnectionsPool } from '../../singletons/sockeio/pool';
import { SOCKET_IO_EVENTS } from '../../handlers/socket/topics';

import { db } from '../../singletons/Database';
import { users } from '../../singletons/Database/schema';
import { eq, sql } from 'drizzle-orm';
import { ethers } from 'ethers';

export const handleTradeStart: Processor<QUEUE_WORKERS_DEF[typeof QUEUES.TRADES]['inputs'], QUEUE_WORKERS_DEF[typeof QUEUES.TRADES]['outputs']> = async (
  job: Job<QUEUE_WORKERS_DEF[typeof QUEUES.TRADES]['inputs']>
) => {

  const { placedByWallet, amount, levarage, expiry, pair, price, signature } = job.data;
  console.log('handleTradeStart', job.data);


  const encodedPayload = ethers.AbiCoder.defaultAbiCoder().encode(
    ['uint256', 'uint256', 'uint256', 'string', 'uint256'],
    [amount, levarage, expiry, pair, price]
  );
  const hash = ethers.keccak256(encodedPayload);

  const isValid = ethers.verifyMessage(hash, signature) === placedByWallet;

};


