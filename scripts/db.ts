/**
 * Database CLI.
 *   npm run db:migrate          apply SQL migrations in ./drizzle
 *   npm run db:seed             insert categories + clearly-marked demo products (idempotent)
 *   npm run db:seed -- --reset  delete ALL demo products first, then re-seed
 *   npm run db:remove-demo      delete every demo product (keeps your real products)
 *
 * Uses DATABASE_URL if set, otherwise the local PGlite database in .data/pglite.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { eq, sql } from "drizzle-orm";
import { migrate as migratePg } from "drizzle-orm/postgres-js/migrator";
import { migrate as migrateLite } from "drizzle-orm/pglite/migrator";
import { createDb } from "../src/lib/db/client";
import * as s from "../src/lib/db/schema";
import { CATEGORY_SEED, buildDemoProducts } from "../src/lib/demo/catalogue";

const db = createDb();
const cmd = process.argv[2];
const reset = process.argv.includes("--reset");

async function migrate() {
  const opts = { migrationsFolder: "./drizzle" };
  if (process.env.DATABASE_URL) await migratePg(db, opts);
  else await migrateLite(db as never, opts);
  console.log(`✓ Migrations applied (${process.env.DATABASE_URL ? "Postgres" : "local PGlite"})`);
}

async function seed() {
  for (const c of CATEGORY_SEED) {
    await db
      .insert(s.categories)
      .values(c)
      .onConflictDoUpdate({ target: s.categories.slug, set: { name: c.name, tagline: c.tagline, description: c.description, sortOrder: c.sortOrder } });
  }
  const cats = await db.select().from(s.categories);
  const catId = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  if (reset) await db.delete(s.products).where(eq(s.products.isDemo, true));

  let inserted = 0;
  for (const p of buildDemoProducts()) {
    const { categorySlug, variants, ...rest } = p;
    const [row] = await db
      .insert(s.products)
      .values({
        ...rest,
        categoryId: catId[categorySlug],
        isDemo: true,
        status: "active",
        stockQty: 0,
        trackStock: false,
      })
      .onConflictDoNothing({ target: s.products.slug })
      .returning({ id: s.products.id });
    if (row) {
      inserted++;
      if (variants.length)
        await db.insert(s.productVariants).values(variants.map((v, i) => ({ ...v, productId: row.id, sortOrder: i, stockQty: 0 })));
    }
  }
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(s.products);
  console.log(`✓ Seeded ${CATEGORY_SEED.length} categories, ${inserted} new demo products (total products: ${count})`);
}

async function removeDemo() {
  const res = await db.delete(s.products).where(eq(s.products.isDemo, true)).returning({ id: s.products.id });
  console.log(`✓ Removed ${res.length} demo products`);
}

(async () => {
  if (cmd === "migrate") await migrate();
  else if (cmd === "seed") await seed();
  else if (cmd === "setup") {
    await migrate();
    await seed();
  } else if (cmd === "remove-demo") await removeDemo();
  else {
    console.log("Usage: tsx scripts/db.ts <migrate|seed|setup|remove-demo> [--reset]");
    process.exit(1);
  }
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
