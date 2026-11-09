import "server-only";
import { business, siteUrl } from "@/lib/config";

/**
 * Owner notification email via Resend's free tier (no card required).
 * If RESEND_API_KEY is not set this is a no-op — enquiries and orders are still
 * saved and visible in the admin dashboard.
 *
 * Without a verified domain, Resend only delivers to the Resend account owner's own
 * address, so create the Resend account with the shop's email (NOTIFY_EMAIL).
 *
 * IMPORTANT: callers must `await` this. On serverless hosts (Netlify) work that is
 * still running after the response is sent can be cut off.
 */

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function toHtml(title: string, textBody: string, adminPath?: string) {
  const lines = textBody
    .replace(/\*/g, "")
    .split("\n")
    .map((l) => {
      const m = l.match(/^([^:]{1,40}):\s(.*)$/);
      return m
        ? `<tr><td style="padding:4px 12px 4px 0;color:#6f6760;vertical-align:top;white-space:nowrap">${escapeHtml(m[1])}</td><td style="padding:4px 0;color:#23201e">${escapeHtml(m[2])}</td></tr>`
        : l.trim()
          ? `<tr><td colspan="2" style="padding:6px 0;color:#23201e">${escapeHtml(l)}</td></tr>`
          : `<tr><td colspan="2" style="height:8px"></td></tr>`;
    })
    .join("");
  const button = adminPath
    ? `<p style="margin:24px 0 0"><a href="${siteUrl}${adminPath}" style="background:#6e1a2b;color:#fbf7f0;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold;font-size:13px;letter-spacing:1px">OPEN IN ADMIN</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f6efe3;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#4a0f1c;color:#efe2c2;padding:18px 24px;border-radius:16px 16px 0 0">
    <div style="font-size:11px;letter-spacing:3px;color:#d9c08a">${escapeHtml(business.name.toUpperCase())}</div>
    <div style="font-family:Georgia,serif;font-size:22px;margin-top:6px">${escapeHtml(title)}</div>
  </div>
  <div style="background:#fbf7f0;padding:20px 24px;border-radius:0 0 16px 16px;border:1px solid #e4d4b9;border-top:0">
    <table style="border-collapse:collapse;font-size:14px;line-height:1.5;width:100%">${lines}</table>${button}
  </div>
</div></body></html>`;
}

export async function notifyOwner(subject: string, textBody: string, opts: { replyTo?: string | null; adminPath?: string } = {}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false as const, reason: "not-configured" };
  const to = process.env.NOTIFY_EMAIL || business.email;
  const from = process.env.NOTIFY_FROM || "Madras Cloth Website <onboarding@resend.dev>";
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject: subject.slice(0, 150),
        text: textBody.slice(0, 20000),
        html: toHtml(subject, textBody.slice(0, 20000), opts.adminPath),
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) console.error("notifyOwner: Resend responded", res.status, (await res.text()).slice(0, 300));
    return { sent: res.ok as boolean };
  } catch (e) {
    console.error("notifyOwner failed", e);
    return { sent: false as const, reason: "error" };
  }
}
