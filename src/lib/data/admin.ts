import "server-only";
import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  categories,
  enquiries,
  orderEvents,
  orderItems,
  orders,
  products,
  productVariants,
  type EnquiryStatus,
  type EnquiryType,
  type OrderStatus,
} from "@/lib/db/schema";

const like = (s: string) => `%${s.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;

export async function getDashboardStats() {
  const [[p], [o], [e], lowStock, recentOrders] = await Promise.all([
    db
      .select({
        active: sql<number>`count(*) filter (where ${products.status} = 'active')::int`,
        drafts: sql<number>`count(*) filter (where ${products.status} = 'draft')::int`,
        demo: sql<number>`count(*) filter (where ${products.isDemo})::int`,
        real: sql<number>`count(*) filter (where not ${products.isDemo})::int`,
      })
      .from(products),
    db
      .select({
        pending: sql<number>`count(*) filter (where ${orders.status} = 'pending')::int`,
        open: sql<number>`count(*) filter (where ${orders.status} in ('confirmed','packed','shipped'))::int`,
        last30: sql<number>`count(*) filter (where ${orders.createdAt} > now() - interval '30 days')::int`,
        value30: sql<number>`coalesce(sum(${orders.totalPaise}) filter (where ${orders.createdAt} > now() - interval '30 days' and ${orders.status} <> 'cancelled' and not ${orders.containsDemoItems}), 0)::bigint`,
      })
      .from(orders),
    db.select({ fresh: sql<number>`count(*) filter (where ${enquiries.status} = 'new')::int` }).from(enquiries),
    db
      .select({ id: products.id, name: products.name, stockQty: products.stockQty, saleUnit: products.saleUnit, threshold: products.lowStockThreshold })
      .from(products)
      .where(and(eq(products.isDemo, false), eq(products.trackStock, true), eq(products.status, "active"), sql`${products.stockQty} <= ${products.lowStockThreshold}`))
      .orderBy(asc(products.stockQty))
      .limit(8),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
  ]);
  return { products: p, orders: { ...o, value30: Number(o.value30) }, enquiries: e, lowStock, recentOrders };
}

export async function listAdminProducts(f: { q?: string; category?: string; status?: string; demo?: string; page?: number }) {
  const w: SQL[] = [];
  if (f.q) w.push(or(ilike(products.name, like(f.q)), ilike(products.slug, like(f.q)), ilike(products.sku, like(f.q)))!);
  if (f.category) w.push(eq(categories.slug, f.category));
  if (f.status === "draft" || f.status === "active" || f.status === "archived") w.push(eq(products.status, f.status));
  if (f.demo === "yes") w.push(eq(products.isDemo, true));
  if (f.demo === "no") w.push(eq(products.isDemo, false));
  const where = w.length ? and(...w) : undefined;
  const perPage = 50;
  const page = Math.max(1, f.page ?? 1);
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ p: products, categoryName: categories.name, variantCount: sql<number>`(select count(*)::int from ${productVariants} v where v.product_id = ${products.id})` })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(desc(products.updatedAt))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ total: count() }).from(products).innerJoin(categories, eq(products.categoryId, categories.id)).where(where),
  ]);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getProductForEdit(id: string) {
  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!p) return null;
  const variants = await db.select().from(productVariants).where(eq(productVariants.productId, id)).orderBy(asc(productVariants.sortOrder));
  return { ...p, variants };
}

export async function listCategoriesAdmin() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function listOrders(f: { status?: string; q?: string; page?: number }) {
  const w: SQL[] = [];
  if (f.status) w.push(eq(orders.status, f.status as OrderStatus));
  if (f.q) w.push(or(ilike(orders.orderNumber, like(f.q)), ilike(orders.customerName, like(f.q)), ilike(orders.phone, like(f.q)))!);
  const where = w.length ? and(...w) : undefined;
  const perPage = 40;
  const page = Math.max(1, f.page ?? 1);
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ o: orders, itemCount: sql<number>`(select count(*)::int from ${orderItems} i where i.order_id = ${orders.id})` })
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ total: count() }).from(orders).where(where),
  ]);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getOrder(id: string) {
  const [o] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!o) return null;
  const [items, events] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, id)).orderBy(desc(orderEvents.createdAt)),
  ]);
  return { ...o, items, events };
}

export async function listEnquiries(f: { type?: string; status?: string; page?: number }) {
  const w: SQL[] = [];
  if (f.type) w.push(eq(enquiries.type, f.type as EnquiryType));
  if (f.status) w.push(eq(enquiries.status, f.status as EnquiryStatus));
  const where = w.length ? and(...w) : undefined;
  const perPage = 40;
  const page = Math.max(1, f.page ?? 1);
  const [rows, [{ total }]] = await Promise.all([
    db.select().from(enquiries).where(where).orderBy(desc(enquiries.createdAt)).limit(perPage).offset((page - 1) * perPage),
    db.select({ total: count() }).from(enquiries).where(where),
  ]);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / perPage)) };
}
