import "server-only";
import { business } from "@/lib/config";

/**
 * OPTIONAL owner notification email via Resend's free tier (no card required).
 * If RESEND_API_KEY is not set, this is a no-op — enquiries and orders are still
 * saved and visible in the admin dashboard.
 *
 * Without a verified domain, Resend only delivers to the account owner's own address,
 * so create the Resend account with the shop's email (NOTIFY_EMAIL).
 */
export async function notifyOwner(subject: string, textBody: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false as const, reason: "not-configured" };
  const to = process.env.NOTIFY_EMAIL || business.email;
  const from = process.env.NOTIFY_FROM || "Madras Cloth Website <onboarding@resend.dev>";
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: subject.slice(0, 150), text: textBody.slice(0, 20000) }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    return { sent: res.ok as boolean };
  } catch (e) {
    console.error("notifyOwner failed", e);
    return { sent: false as const, reason: "error" };
  }
}
