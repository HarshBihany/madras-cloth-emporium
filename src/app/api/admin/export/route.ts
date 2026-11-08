import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { categories, products, productVariants } from "@/lib/db/schema";
import { CSV_COLUMNS, toCsv } from "@/lib/csv";

/** Full product export in the same format as the importer (round-trippable backup). */
export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [rows, variants] = await Promise.all([
    db.select({ p: products, cat: categories.slug }).from(products).innerJoin(categories, eq(products.categoryId, categories.id)).orderBy(asc(products.createdAt)),
    db.select().from(productVariants).orderBy(asc(productVariants.sortOrder)),
  ]);
  const vmap = new Map<string, string[]>();
  for (const v of variants) vmap.set(v.productId, [...(vmap.get(v.productId) ?? []), [v.label, v.stockQty, v.pricePaise != null ? v.pricePaise / 100 : ""].filter((x) => x !== "").join(":")]);
  const yn = (b: boolean) => (b ? "yes" : "no");
  const data = rows.map(({ p, cat }) => ({
    slug: p.slug,
    name: p.name,
    category: cat,
    sale_unit: p.saleUnit,
    price: p.pricePaise / 100,
    mrp: p.mrpPaise != null ? p.mrpPaise / 100 : "",
    stock: p.stockQty,
    min_qty: p.minQty,
    qty_step: p.qtyStep,
    track_stock: yn(p.trackStock),
    low_stock_threshold: p.lowStockThreshold,
    fabric: p.fabric,
    colour: p.colour,
    occasion: p.occasion,
    work: p.work,
    width_inches: p.widthInches ?? "",
    short_description: p.shortDescription,
    description: p.description,
    care: p.care,
    tags: p.tags.join("|"),
    images: p.images.join("|"),
    variants: (vmap.get(p.id) ?? []).join("|"),
    status: p.status,
    featured: yn(p.featured),
    is_demo: yn(p.isDemo),
    sku: p.sku ?? "",
    hsn_code: p.hsnCode ?? "",
    gst_rate: p.gstRatePct ?? "",
    art_pattern: p.artPattern,
    art_colors: p.artColors.join("|"),
  }));
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse("﻿" + toCsv(data, CSV_COLUMNS), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mce-products-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
