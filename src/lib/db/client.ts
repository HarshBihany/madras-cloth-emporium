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
  acquireLocalLock();
  const lite = new PGlite(PGLITE_DIR);
  return drizzleLite(lite, { schema }) as unknown as Db;
}

/**
 * PGlite is single-process. Two processes opening the same directory (e.g. `npm run dev`
 * plus `npm run db:seed`) can corrupt it, so we hold a PID lock file while it's open.
 */
function acquireLocalLock() {
  const lockFile = path.join(PGLITE_DIR, "..", "pglite.lock");
  const isAlive = (pid: number) => {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  };
  const holder = () => {
    try {
      const pid = Number(fs.readFileSync(lockFile, "utf8"));
      return pid && pid !== process.pid && isAlive(pid) ? pid : null;
    } catch {
      return null;
    }
  };
  // `next dev` briefly overlaps old and new server processes when it restarts,
  // so wait (synchronously) up to 15s for the previous holder to exit.
  const sleeper = new Int32Array(new SharedArrayBuffer(4));
  const deadline = Date.now() + 15_000;
  let other = holder();
  while (other && Date.now() < deadline) {
    Atomics.wait(sleeper, 0, 0, 200);
    other = holder();
  }
  if (other)
    throw new Error(
      `The local database is already open in another process (pid ${other}). Stop \`npm run dev\` (or that process) first, or set DATABASE_URL.`,
    );
  fs.writeFileSync(lockFile, String(process.pid));
  const release = () => {
    try {
      if (fs.readFileSync(lockFile, "utf8") === String(process.pid)) fs.unlinkSync(lockFile);
    } catch {}
  };
  process.once("exit", release);
  for (const sig of ["SIGINT", "SIGTERM"] as const) process.once(sig, () => (release(), process.exit(0)));
}
