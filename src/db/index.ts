import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { dbPool?: Pool };

export const pool =
  globalForDb.dbPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") globalForDb.dbPool = pool;

export const db = drizzle(pool, { schema });
