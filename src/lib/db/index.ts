import "server-only";
import { createDb, type Db } from "./client";

/**
 * Server-only database handle, opened LAZILY on first query.
 * - DATABASE_URL set  → Postgres (Supabase / Neon / any Postgres) via postgres.js
 * - DATABASE_URL unset → embedded PGlite in ./.data/pglite (local development)
 *
 * Lazy opening matters: Next.js imports route modules in helper worker processes
 * (static-path discovery, build-time page data collection). Those workers must not
 * open connections — and must never open the single-process PGlite directory.
 * The instance is cached on globalThis so dev hot-reload reuses it.
 */
const g = globalThis as unknown as { __mceDb?: Db };

function getDb(): Db {
  return (g.__mceDb ??= createDb());
}

export const db: Db = new Proxy({} as Db, {
  get(_t, prop) {
    const real = getDb() as unknown as Record<PropertyKey, unknown>;
    const v = real[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(real) : v;
  },
});

export * as schema from "./schema";
