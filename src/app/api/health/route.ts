import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Lightweight health check — also keeps a free Supabase project from pausing
 * (see .github/workflows/keepalive.yml). On failure it returns only a coarse,
 * non-secret reason code to help diagnose configuration problems.
 */
function reason(e: unknown) {
  const err = e as { code?: string; cause?: { code?: string; message?: string }; message?: string };
  const code = err?.cause?.code ?? err?.code ?? "";
  const msg = `${err?.cause?.message ?? ""} ${err?.message ?? ""}`.toLowerCase();
  if (!process.env.DATABASE_URL) return "DATABASE_URL_missing";
  if (code === "ENOTFOUND" || msg.includes("enotfound")) return "host_not_found";
  if (code === "28P01" || msg.includes("password authentication failed")) return "wrong_password";
  if (msg.includes("tenant or user not found")) return "wrong_pooler_host_or_user";
  if (code === "ECONNREFUSED") return "connection_refused";
  if (code === "ETIMEDOUT" || msg.includes("timeout")) return "timeout";
  if (code === "42P01") return "tables_missing";
  if (msg.includes("invalid url") || msg.includes("invalid connection")) return "malformed_url";
  return code ? `error_${code}` : "unknown";
}

export async function GET() {
  try {
    await db.execute(sql`select 1 from categories limit 1`);
    return NextResponse.json({ ok: true, db: "up", at: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ ok: false, db: "down", reason: reason(e) }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
