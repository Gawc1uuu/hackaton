export const QUEUES = {
  REGISTRATION: 'REGISTRATION',
  TRADES: 'TRADES',
} as const;

export type QUEUE_WORKERS_DEF = {
  [QUEUES.REGISTRATION]: {
    inputs: {
      socketId: string;
      walletAddress: string;
      sessionPubKey: string;
      signature: string;
    };
    outputs: {
      walletAddress: string;
    };
  };
  [QUEUES.TRADES]: {
    inputs: {
      placedByWallet: string;
      amount: number;
      levarage: number;
      expiry: string;
      pair: string;
      price: number;
      signature: string;
    };
    outputs: void;
  };
};
