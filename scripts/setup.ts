/**
 * First-run local setup:
 *  1. creates .env.local with a random SESSION_SECRET and an admin password (printed once)
 *  2. applies migrations and seeds demo data into the local PGlite database
 */
import fs from "node:fs";
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { hashPassword } from "../src/lib/auth/password";

(async () => {
  const envPath = ".env.local";
  if (!fs.existsSync(envPath)) {
    const password = randomBytes(9).toString("base64url");
    const hash = await hashPassword(password);
    const env = [
      "# Local development settings (never commit this file)",
      "NEXT_PUBLIC_SITE_URL=http://localhost:3000",
      "ADMIN_EMAIL=admin@localhost",
      `ADMIN_PASSWORD_HASH=${hash}`,
      `SESSION_SECRET=${randomBytes(32).toString("base64url")}`,
      "# Leave DATABASE_URL empty to use the embedded local database (.data/pglite)",
      "DATABASE_URL=",
      "",
    ].join("\n");
    fs.writeFileSync(envPath, env, { mode: 0o600 });
    console.log("\n✓ Created .env.local");
    console.log("──────────────────────────────────────────────");
    console.log("  Admin login (local):  http://localhost:3000/admin");
    console.log("  Email:     admin@localhost");
    console.log(`  Password:  ${password}`);
    console.log("  (shown once — change with: npm run admin:hash -- \"new-password\")");
    console.log("──────────────────────────────────────────────\n");
  } else {
    console.log("• .env.local already exists — leaving it unchanged");
  }
  execSync("npx tsx scripts/db.ts setup", { stdio: "inherit" });
  console.log("\nNext: npm run dev  →  http://localhost:3000\n");
})();
