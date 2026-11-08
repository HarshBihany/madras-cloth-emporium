import "server-only";
import { createDb, type Db } from "./client";

/**
 * Server-only database handle.
 * - DATABASE_URL set  → Postgres (Supabase / Neon / any Postgres) via postgres.js
 * - DATABASE_URL unset → embedded PGlite in ./.data/pglite (local development)
 * The handle is cached on globalThis so dev hot-reload doesn't open new connections.
 */
const g = globalThis as unknown as { __mceDb?: Db };

export const db: Db = g.__mceDb ?? (g.__mceDb = createDb());

export * as schema from "./schema";
