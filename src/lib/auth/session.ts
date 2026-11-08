import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySessionToken } from "./jwt";

export async function createSession(email: string) {
  const token = await signSession(email);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession() {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Call at the top of EVERY admin page and server action. */
export async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}
