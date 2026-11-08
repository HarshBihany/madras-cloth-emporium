"use server";

import { timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string; email?: string; n?: number };

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function login(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase().slice(0, 120);
  const password = String(fd.get("password") ?? "").slice(0, 200);
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH ?? "";

  if (!adminEmail || !hash || !process.env.SESSION_SECRET) {
    return { error: "Admin login is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and SESSION_SECRET.", email };
  }
  const ip = await clientIp();
  // 5 attempts per 15 minutes per IP, plus a global cap against distributed guessing
  const [okIp, okGlobal] = await Promise.all([rateLimit("login", 5, 15 * 60, ip), rateLimit("login-all", 50, 15 * 60, "global")]);
  if (!okIp || !okGlobal) return { error: "Too many attempts. Please wait 15 minutes and try again.", email, n: (_prev.n ?? 0) + 1 };

  // Always run the (slow) password check to keep timing uniform
  const passOk = await verifyPassword(password, hash);
  if (!(safeEqual(email, adminEmail) && passOk)) return { error: "Incorrect email or password.", email, n: (_prev.n ?? 0) + 1 };

  await createSession(adminEmail);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
