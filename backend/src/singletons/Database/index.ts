import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

const client = postgres(process.env.DB_CONNECTION_STRING!);
export const db = drizzle(client, { schema });
