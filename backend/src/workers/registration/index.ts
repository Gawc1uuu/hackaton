import { Job, Processor } from 'bullmq';
import { QUEUE_WORKERS_DEF, QUEUES } from '../../singletons/BullMq/constants';
import { SocketConnectionsPool } from '../../singletons/sockeio/pool';
import { db } from '../../singletons/Database';
import { users } from '../../singletons/Database/schema';

import { SOCKET_IO_EVENTS } from '../../handlers/socket/topics';

import nacl from 'tweetnacl';
import hexToUint8Array from '../../utils/hexToUint8Array';
import { ethers } from 'ethers';

async function verifySignature(message: string, signature: string, expectedAddress: string) {
  // ethers.utils.verifyMessage will return the address that signed the message
  const recoveredAddress = ethers.verifyMessage(message, signature);
  return recoveredAddress === expectedAddress;
}

export const handleRegistrationJob: Processor<
  QUEUE_WORKERS_DEF[typeof QUEUES.REGISTRATION]['inputs'],
  QUEUE_WORKERS_DEF[typeof QUEUES.REGISTRATION]['outputs']
> = async (job: Job<QUEUE_WORKERS_DEF[typeof QUEUES.REGISTRATION]['inputs']>) => {
  const { walletAddress, socketId, signature, sessionPubKey } = job.data;

  console.log('handleRegistrationJob');

  // Message that was supposedly signed (the same message that was signed by the private key)
  const message = `I sign this message ${sessionPubKey}`;

  // Verify the signature using ethers.js
  const isSignatureValid = await verifySignature(message, signature, walletAddress);

  if (!isSignatureValid) {
    console.error('Invalid signature!');
    throw new Error('Signature verification failed');
  }

  console.log('Signature verified successfully!');
  console.log(isSignatureValid)

  // Save the user to the database
  await db.insert(users).values({
    walletAddress,
    sessionKeyPub: sessionPubKey,
    nonce: 0,
  }).execute();

  console.log('User saved to the database!', walletAddress);

  // Continue with the rest of the job processing...
  return { walletAddress };
};


