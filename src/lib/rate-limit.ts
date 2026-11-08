import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

/** Best-effort client IP (Netlify sets x-nf-client-connection-ip). */
export async function clientIp() {
  const h = await headers();
  return (
    h.get("x-nf-client-connection-ip") ||
    h.get("cf-connecting-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

/** IPs are hashed with a secret before storage — we never store raw IP addresses. */
function fingerprint(ip: string) {
  return createHash("sha256")
    .update(`${process.env.SESSION_SECRET ?? "dev"}:${ip}`)
    .digest("base64url")
    .slice(0, 22);
}

/**
 * Fixed-window rate limiter backed by Postgres, so it holds across serverless instances.
 * Returns true when the request is allowed.
 */
export async function rateLimit(scope: string, limit: number, windowSeconds: number, ip?: string) {
  const key = `${scope}:${fingerprint(ip ?? (await clientIp()))}`;
  try {
    const rows = await db.execute<{ count: number }>(sql`
      insert into rate_limits (key, window_start, count) values (${key}, now(), 1)
      on conflict (key) do update set
        count = case when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds}) then 1 else rate_limits.count + 1 end,
        window_start = case when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds}) then now() else rate_limits.window_start end
      returning count`);
    const list = (Array.isArray(rows) ? rows : (rows as unknown as { rows: { count: number }[] }).rows) as { count: number }[];
    return Number(list[0]?.count ?? 1) <= limit;
  } catch (e) {
    console.error("rateLimit failed (allowing request)", e);
    return true;
  }
}

/** Occasional cleanup of stale windows (called opportunistically). */
export async function pruneRateLimits() {
  if (Math.random() > 0.02) return;
  await db.execute(sql`delete from rate_limits where window_start < now() - interval '2 days'`).catch(() => {});
}
