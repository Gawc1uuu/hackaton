import { Socket } from 'socket.io';
import { z } from 'zod';
import { BullMQSingleton } from '../../singletons/BullMq';
import { QUEUES } from '../../singletons/BullMq/constants';

const tradeSchema = z.object({
    amount: z.number(),
    levarage: z.number(),
    expiry: z.string(),
    pair: z.string(),
    price: z.number(),
    signature: z.string(),
    placedByWallet: z.string(),
});

export async function tradingHandler(socket: Socket, payload: any) {
    // Ensure payload is valid
    const payloadValidation = tradeSchema.safeParse(payload);
    if (!payloadValidation.success) {
        console.log(payloadValidation.error);
        socket.disconnect(true);
        return;
    }

    // Add to registration queue
    const jobId = `trade-${socket.id}`;
    BullMQSingleton.getInstance().getQueue(QUEUES.TRADES).add(jobId, {
        ...payloadValidation.data,
    });
}
