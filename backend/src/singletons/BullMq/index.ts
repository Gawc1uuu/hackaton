import { Queue, Worker, Processor } from 'bullmq';
import { redisConnection } from '../redis';
import { QUEUES, QUEUE_WORKERS_DEF } from './constants';

type WorkerQueuePair = {
  worker: Worker;
  queue: Queue;
};

export class BullMQSingleton {
  private static instance: BullMQSingleton | null = null;

  private queues = new Map<string, WorkerQueuePair>();

  public createQueue<K extends keyof typeof QUEUES>(
    queueName: K,
    workerHandler: Processor<QUEUE_WORKERS_DEF[(typeof QUEUES)[K]]['inputs'], QUEUE_WORKERS_DEF[(typeof QUEUES)[K]]['outputs']>
  ): Queue {
    const queue = new Queue(queueName, {
      connection: redisConnection!,
      defaultJobOptions: {
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        attempts: 5,
      },
    });
    const worker = new Worker(
      queueName,
      (job) => {
        return workerHandler(job).catch((err) => console.log(err));
      },
      { connection: redisConnection! }
    );
    this.queues.set(queueName, { worker, queue });
    return queue;
  }
  public getQueue(queueName: keyof typeof QUEUES): Queue<QUEUE_WORKERS_DEF[keyof typeof QUEUES]['inputs']> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }
    return queue.queue;
  }

  public getAllQueues(): Queue[] {
    return Array.from(this.queues.values()).map((pair) => pair.queue);
  }

  public static getInstance(): BullMQSingleton {
    if (!BullMQSingleton.instance) {
      BullMQSingleton.instance = new BullMQSingleton();
    }

    return BullMQSingleton.instance;
  }
}
