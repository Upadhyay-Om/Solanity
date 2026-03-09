import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export async function connectDB() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();

    console.log('[PostgreSQL] Connected successfully');
  } catch (error) {
    console.error(`[PostgreSQL] Connection failed: ${error.message}`);
    process.exit(1);
  }
}