import { drizzle as drizzlePg, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle as drizzleLite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import postgres from "postgres";
import path from "node:path";
import fs from "node:fs";
import * as schema from "./schema";

// Both drivers expose the same query-builder API; we type against postgres-js.
export type Db = PostgresJsDatabase<typeof schema>;

export const PGLITE_DIR = path.join(process.cwd(), ".data", "pglite");

export function createDb(): Db {
  const url = process.env.DATABASE_URL;
  if (url) {
    const client = postgres(url, {
      // Supabase transaction pooler (port 6543) doesn't support prepared statements
      prepare: false,
      // Serverless: keep a tiny pool per function instance
      max: Number(process.env.DATABASE_POOL_MAX || 3),
      idle_timeout: 20,
      connect_timeout: 15,
      ssl: url.includes("localhost") || url.includes("127.0.0.1") ? false : "require",
    });
    return drizzlePg(client, { schema });
  }

  if (process.env.NODE_ENV === "production" && process.env.NETLIFY) {
    throw new Error("DATABASE_URL is required in production. See docs/DEPLOYMENT.md.");
  }
  fs.mkdirSync(PGLITE_DIR, { recursive: true });
  const lite = new PGlite(PGLITE_DIR);
  return drizzleLite(lite, { schema }) as unknown as Db;
}
