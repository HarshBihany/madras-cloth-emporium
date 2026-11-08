import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "mce_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function secretKey() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ chars). Run `npm run admin:hash -- <password>`.");
  return new TextEncoder().encode(s);
}

export async function signSession(email: string) {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .setIssuer("mce")
    .setAudience("mce-admin")
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"], issuer: "mce", audience: "mce-admin" });
    if (payload.role !== "admin" || typeof payload.sub !== "string") return null;
    return { email: payload.sub };
  } catch {
    return null;
  }
}
