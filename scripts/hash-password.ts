/**
 * Generate an admin password hash and a session secret.
 *   npm run admin:hash -- "your-strong-password"
 * Paste the output into .env.local (local) or your host's environment variables.
 */
import { randomBytes } from "node:crypto";
import { hashPassword } from "../src/lib/auth/password";

const pw = process.argv[2];
if (!pw || pw.length < 10) {
  console.error('Usage: npm run admin:hash -- "a-password-of-at-least-10-characters"');
  process.exit(1);
}

(async () => {
  const hash = await hashPassword(pw);
  console.log("\nAdd these to your environment:\n");
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log(`SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
  console.log("\n(SESSION_SECRET only needs generating once; changing it signs everyone out.)\n");
})();
