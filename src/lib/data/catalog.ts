import "server-only";
import { and, asc, desc, eq, gte, ilike, inArray, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products, productVariants, type Category, type Product, type ProductVariant } from "@/lib/db/schema";

export type ProductWithCategory = Product & { category: Pick<Category, "slug" | "name"> };
export type ProductDetail = ProductWithCategory & { variants: ProductVariant[] };

import { SORTS, type SortKey } from "@/lib/sorts";
export { SORTS, type SortKey };

export type CatalogFilters = {
  q?: string;
  category?: string;
  fabric?: string[];
  colour?: string[];
  occasion?: string[];
  unit?: "piece" | "metre";
  min?: number; // rupees
  max?: number; // rupees
  inStock?: boolean;
  sort?: SortKey;
  page?: number;
  perPage?: number;
};

const productCols = {
  product: products,
  category: { slug: categories.slug, name: categories.name },
};

function escapeLike(s: string) {
  return s.replace(/[\\%_]/g, (m) => `\\${m}`);
}

/** Parse URLSearchParams-style input into validated filters (never trusts raw input). */
export function parseFilters(sp: Record<string, string | string[] | undefined>, fixedCategory?: string): CatalogFilters {
  const one = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v)?.trim().slice(0, 80) || undefined;
  };
  const many = (k: string) => {
    const v = sp[k];
    const arr = (Array.isArray(v) ? v : v ? [v] : []).flatMap((x) => x.split(","));
    return arr.map((x) => x.trim().slice(0, 60)).filter(Boolean).slice(0, 12);
  };
  const num = (k: string) => {
    const n = Number(one(k));
    return Number.isFinite(n) && n >= 0 ? Math.min(n, 1_000_000) : undefined;
  };
  const sort = one("sort");
  const unit = one("unit");
  return {
    q: one("q"),
    category: fixedCategory ?? one("category"),
    fabric: many("fabric"),
    colour: many("colour"),
    occasion: many("occasion"),
    unit: unit === "piece" || unit === "metre" ? unit : undefined,
    min: num("min"),
    max: num("max"),
    inStock: one("stock") === "1",
    sort: sort && sort in SORTS ? (sort as SortKey) : "featured",
    page: Math.max(1, Math.floor(num("page") ?? 1)),
    perPage: 24,
  };
}

function buildWhere(f: CatalogFilters, opts: { skipFacet?: "fabric" | "colour" | "occasion" } = {}) {
  const w: SQL[] = [eq(products.status, "active")];
  if (f.category) w.push(eq(categories.slug, f.category));
  if (f.q) {
    const term = `%${escapeLike(f.q)}%`;
    w.push(
      or(
        ilike(products.name, term),
        ilike(products.fabric, term),
        ilike(products.colour, term),
        ilike(products.occasion, term),
        ilike(products.work, term),
        ilike(products.shortDescription, term),
        ilike(categories.name, term),
        sql`array_to_string(${products.tags}, ' ') ilike ${term}`,
      )!,
    );
  }
  if (f.fabric?.length && opts.skipFacet !== "fabric") w.push(inArray(products.fabric, f.fabric));
  if (f.colour?.length && opts.skipFacet !== "colour") w.push(inArray(products.colour, f.colour));
  if (f.occasion?.length && opts.skipFacet !== "occasion") w.push(inArray(products.occasion, f.occasion));
  if (f.unit) w.push(eq(products.saleUnit, f.unit));
  if (f.min != null) w.push(gte(products.pricePaise, Math.round(f.min * 100)));
  if (f.max != null) w.push(lte(products.pricePaise, Math.round(f.max * 100)));
  if (f.inStock) {
    // Demo products are never considered "in stock".
    w.push(eq(products.isDemo, false));
    w.push(or(eq(products.trackStock, false), sql`${products.stockQty} > 0`)!);
  }
  return and(...w);
}

export async function listProducts(f: CatalogFilters) {
  const perPage = f.perPage ?? 24;
  const page = f.page ?? 1;
  const where = buildWhere(f);
  const order =
    f.sort === "price-asc"
      ? [asc(products.pricePaise)]
      : f.sort === "price-desc"
        ? [desc(products.pricePaise)]
        : f.sort === "newest"
          ? [desc(products.createdAt)]
          : [desc(products.featured), asc(categories.sortOrder), desc(products.createdAt)];

  const [rows, [{ total }]] = await Promise.all([
    db
      .select(productCols)
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(...order, asc(products.id))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where),
  ]);

  return {
    items: rows.map((r) => ({ ...r.product, category: r.category })) as ProductWithCategory[],
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
  };
}

/** Distinct facet values (with counts) honouring other active filters. */
export async function getFacets(f: CatalogFilters) {
  const cols = { fabric: products.fabric, colour: products.colour, occasion: products.occasion };
  const facet = async (key: "fabric" | "colour" | "occasion") => {
    const col = cols[key] as typeof products.fabric;
    return db
      .select({ value: col, count: sql<number>`count(*)::int` })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(buildWhere(f, { skipFacet: key }), ne(col, "")))
      .groupBy(col)
      .orderBy(asc(col));
  };
  const [fabric, colour, occasion] = await Promise.all([facet("fabric"), facet("colour"), facet("occasion")]);
  return { fabric, colour, occasion };
}

export async function getCategories() {
  const rows = await db
    .select({
      category: categories,
      count: sql<number>`count(${products.id}) filter (where ${products.status} = 'active')::int`,
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder));
  return rows.map((r) => ({ ...r.category, productCount: r.count }));
}

export async function getCategory(slug: string) {
  const [c] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return c ?? null;
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const [row] = await db
    .select(productCols)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.status, "active")))
    .limit(1);
  if (!row) return null;
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, row.product.id))
    .orderBy(asc(productVariants.sortOrder));
  return { ...row.product, category: row.category, variants };
}

export async function getFeatured(limit = 8) {
  const rows = await db
    .select(productCols)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.status, "active"), eq(products.featured, true)))
    .orderBy(asc(categories.sortOrder), desc(products.createdAt))
    .limit(limit * 3);
  // interleave categories for a varied editorial rail
  const byCat = new Map<string, ProductWithCategory[]>();
  for (const r of rows) {
    const p = { ...r.product, category: r.category } as ProductWithCategory;
    byCat.set(p.category.slug, [...(byCat.get(p.category.slug) ?? []), p]);
  }
  const out: ProductWithCategory[] = [];
  while (out.length < limit && [...byCat.values()].some((l) => l.length)) {
    for (const l of byCat.values()) if (l.length && out.length < limit) out.push(l.shift()!);
  }
  return out;
}

export async function getRelated(p: ProductWithCategory, limit = 4) {
  const rows = await db
    .select(productCols)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.status, "active"), eq(products.categoryId, p.categoryId), ne(products.id, p.id)))
    .orderBy(sql`(${products.occasion} = ${p.occasion}) desc`, desc(products.featured), desc(products.createdAt))
    .limit(limit);
  return rows.map((r) => ({ ...r.product, category: r.category })) as ProductWithCategory[];
}

export async function getCategoryCovers() {
  // one representative featured product per category, used for category art
  const rows = await db
    .select(productCols)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.status, "active"))
    .orderBy(asc(categories.sortOrder), desc(products.featured), asc(products.createdAt));
  const map = new Map<string, ProductWithCategory>();
  for (const r of rows) if (!map.has(r.category.slug)) map.set(r.category.slug, { ...r.product, category: r.category } as ProductWithCategory);
  return map;
}

export async function getAllActiveSlugs() {
  return db
    .select({ slug: products.slug, updatedAt: products.updatedAt, isDemo: products.isDemo })
    .from(products)
    .where(eq(products.status, "active"));
}

export { availability } from "@/lib/availability";
