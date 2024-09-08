import exp from 'constants';
import { pgTable, serial, varchar, timestamp, integer, numeric, boolean, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  walletAddress: varchar('wallet_address').primaryKey().unique(),
  sessionKeyPub: varchar('session_key_pub').notNull().unique(),
  nonce: integer('nonce').notNull().default(0),
});

export const trades = pgTable(
  'trades',
  {
    tradeId: serial('trade_id').primaryKey(),
    placedByWallet: varchar('placed_by_wallet').notNull(),
    amount: varchar('amount').notNull(),
    levarage: integer('levarage').notNull(),
    expiry: numeric('expiry').notNull(),
    pair: varchar('pair').notNull(),
    price: numeric('price').notNull(),
  }
);
