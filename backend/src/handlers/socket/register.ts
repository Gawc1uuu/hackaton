import { Socket } from 'socket.io';
import { z } from 'zod';
import { BullMQSingleton } from '../../singletons/BullMq';
import { QUEUES } from '../../singletons/BullMq/constants';

const userRegistrationSchema = z.object({
  walletAddress: z.string(),
  signature: z.string(),
  sessionPubKey: z.string(),
});

export async function userRegistrationHandler(socket: Socket, payload: any) {
  // Ensure payload is valid 
  const payloadValidation = userRegistrationSchema.safeParse(payload);
  if (!payloadValidation.success) {
    console.log(payloadValidation.error);
    socket.disconnect(true);
    return;
  }

  // Add to registration queue
  const jobId = `registration-${socket.id}`;
  BullMQSingleton.getInstance()
    .getQueue(QUEUES.REGISTRATION)
    .add(jobId, {
      ...payloadValidation.data,
      socketId: socket.id,
    });
}
