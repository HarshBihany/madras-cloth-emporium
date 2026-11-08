"use server";

import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { categories, enquiries, orderEvents, orderItems, orders, products, productVariants, type OrderStatus } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { productInput, slugify, type ProductInput } from "@/lib/product-input";
import { toFieldErrors, type FieldErrors, clean } from "@/lib/validation";
import { uploadProductImage } from "@/lib/storage";
import { parseProductCsv, type RowError } from "@/lib/csv";
import { ORDER_TRANSITIONS } from "@/lib/order-status";

/* ───────────── Products ───────────── */

export type SaveProductState = { ok?: boolean; message?: string; fieldErrors?: FieldErrors; id?: string };

function toRow(v: ProductInput, slug: string) {
  return {
    slug,
    sku: v.sku || null,
    name: v.name,
    categoryId: v.categoryId,
    shortDescription: v.shortDescription,
    description: v.description,
    fabric: v.fabric,
    colour: v.colour,
    occasion: v.occasion,
    work: v.work,
    widthInches: v.widthInches,
    care: v.care,
    saleUnit: v.saleUnit,
    pricePaise: v.price,
    mrpPaise: v.mrp,
    minQty: v.minQty,
    qtyStep: v.qtyStep,
    stockQty: v.stockQty,
    trackStock: v.trackStock,
    lowStockThreshold: v.lowStockThreshold,
    isDemo: v.isDemo,
    status: v.status,
    featured: v.featured,
    tags: v.tags,
    images: v.images,
    attributes: v.attributes,
    artPattern: v.artPattern,
    artColors: v.artColors,
    hsnCode: v.hsnCode,
    gstRatePct: v.gstRatePct,
    updatedAt: new Date(),
  };
}

/** Accepts the product editor payload as JSON (built by the client form). */
export async function saveProduct(_prev: SaveProductState, fd: FormData): Promise<SaveProductState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  let raw: unknown;
  try {
    raw = JSON.parse(String(fd.get("payload") ?? "{}"));
  } catch {
    return { message: "Invalid form data." };
  }
  const parsed = productInput.safeParse(raw);
  if (!parsed.success) return { message: "Please fix the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) };
  const v = parsed.data;
  const slug = v.slug || slugify(v.name);

  const [clash] = await db
    .select({ id: products.id })
    .from(products)
    .where(id ? and(eq(products.slug, slug), ne(products.id, id)) : eq(products.slug, slug))
    .limit(1);
  if (clash) return { message: "Another product already uses this URL slug.", fieldErrors: { slug: "Already in use — change it" } };

  let productId = id;
  try {
    await db.transaction(async (tx) => {
      if (id) {
        const res = await tx.update(products).set(toRow(v, slug)).where(eq(products.id, id)).returning({ id: products.id });
        if (!res.length) throw new Error("NOT_FOUND");
      } else {
        const [row] = await tx.insert(products).values(toRow(v, slug)).returning({ id: products.id });
        productId = row.id;
      }
      // Sync variants: update existing, insert new, delete removed
      const existing = await tx.select({ id: productVariants.id }).from(productVariants).where(eq(productVariants.productId, productId));
      const keep = new Set(v.variants.map((x) => x.id).filter(Boolean) as string[]);
      const toDelete = existing.map((e) => e.id).filter((x) => !keep.has(x));
      if (toDelete.length) await tx.delete(productVariants).where(inArray(productVariants.id, toDelete));
      for (const [i, x] of v.variants.entries()) {
        const vals = { optionType: x.optionType, label: x.label, sku: x.sku || null, pricePaise: x.price, stockQty: x.stockQty, sortOrder: i };
        if (x.id && existing.some((e) => e.id === x.id)) await tx.update(productVariants).set(vals).where(eq(productVariants.id, x.id));
        else await tx.insert(productVariants).values({ ...vals, productId });
      }
      // When variants exist, product-level stock = sum of variant stock
      if (v.variants.length) {
        const total = v.variants.reduce((s, x) => s + x.stockQty, 0);
        await tx.update(products).set({ stockQty: total }).where(eq(products.id, productId));
      }
    });
  } catch (e) {
    if (String(e).includes("NOT_FOUND")) return { message: "Product not found." };
    console.error("saveProduct", e);
    return { message: "Could not save the product. Please try again." };
  }
  revalidatePath("/admin/products");
  if (!id) redirect(`/admin/products/${productId}?saved=1`);
  return { ok: true, message: "Saved.", id: productId };
}

const quickSchema = z.object({
  id: z.uuid(),
  price: z.coerce.number().min(0).max(1_000_000),
  stock: z.coerce.number().min(0).max(1_000_000),
  status: z.enum(["draft", "active", "archived"]),
});

export async function quickUpdateProduct(fd: FormData) {
  await requireAdmin();
  const p = quickSchema.safeParse({ id: fd.get("id"), price: fd.get("price"), stock: fd.get("stock"), status: fd.get("status") });
  if (!p.success) return;
  const [hasVariants] = await db.select({ id: productVariants.id }).from(productVariants).where(eq(productVariants.productId, p.data.id)).limit(1);
  await db
    .update(products)
    .set({
      pricePaise: Math.round(p.data.price * 100),
      ...(hasVariants ? {} : { stockQty: Math.round(p.data.stock * 100) / 100 }),
      status: p.data.status,
      updatedAt: new Date(),
    })
    .where(eq(products.id, p.data.id));
  revalidatePath("/admin/products");
}

export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  const id = z.uuid().safeParse(fd.get("id"));
  if (!id.success) return;
  // Order history keeps product name/price snapshots, so deleting is safe.
  await db.delete(products).where(eq(products.id, id.data));
  revalidatePath("/admin/products");
  redirect("/admin/products?deleted=1");
}

export async function bulkDemoAction(fd: FormData) {
  await requireAdmin();
  const action = fd.get("action");
  if (action === "hide-demo") await db.update(products).set({ status: "archived", updatedAt: new Date() }).where(eq(products.isDemo, true));
  if (action === "show-demo") await db.update(products).set({ status: "active", updatedAt: new Date() }).where(eq(products.isDemo, true));
  if (action === "delete-demo" && fd.get("confirm") === "DELETE") await db.delete(products).where(eq(products.isDemo, true));
  revalidatePath("/admin");
  revalidatePath("/admin/products");
}

export async function uploadImage(fd: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File)) return { error: "No file received." };
  const res = await uploadProductImage(file);
  return "url" in res ? { url: res.url } : { error: res.error };
}

/* ───────────── CSV import ───────────── */

export type ImportState = {
  mode?: "preview" | "done";
  total?: number;
  valid?: number;
  creates?: number;
  updates?: number;
  errors?: RowError[];
  sample?: { line: number; name: string; slug: string; category: string; price: number; unit: string; stock: number; isNew: boolean }[];
  message?: string;
};

export async function importProducts(_prev: ImportState, fd: FormData): Promise<ImportState> {
  await requireAdmin();
  const file = fd.get("file");
  const commit = fd.get("commit") === "1";
  if (!(file instanceof File) || file.size === 0) return { message: "Choose a CSV file first." };
  if (file.size > 2 * 1024 * 1024) return { message: "CSV must be 2 MB or smaller." };
  const text = await file.text();
  const cats = await db.select().from(categories);
  const { rows, errors, total } = parseProductCsv(text, cats);
  const slugs = rows.map((r) => r.data.slug);
  const existing = slugs.length ? await db.select({ id: products.id, slug: products.slug }).from(products).where(inArray(products.slug, slugs)) : [];
  const existingMap = new Map(existing.map((e) => [e.slug, e.id]));
  const catName = new Map(cats.map((c) => [c.id, c.name]));

  const summary = {
    total,
    valid: rows.length,
    creates: rows.filter((r) => !existingMap.has(r.data.slug)).length,
    updates: rows.filter((r) => existingMap.has(r.data.slug)).length,
    errors,
  };

  if (!commit || errors.length) {
    return {
      mode: "preview",
      ...summary,
      sample: rows.slice(0, 25).map((r) => ({
        line: r.line,
        name: r.data.name,
        slug: r.data.slug,
        category: catName.get(r.data.categoryId) ?? "",
        price: r.data.price,
        unit: r.data.saleUnit,
        stock: r.data.stockQty,
        isNew: !existingMap.has(r.data.slug),
      })),
      message: errors.length && commit ? "Fix the errors below and upload again — nothing was imported." : undefined,
    };
  }

  try {
    await db.transaction(async (tx) => {
      for (const r of rows) {
        const v = r.data;
        const row = toRow(v, v.slug);
        let pid = existingMap.get(v.slug);
        if (pid) await tx.update(products).set(row).where(eq(products.id, pid));
        else [{ id: pid }] = await tx.insert(products).values(row).returning({ id: products.id });
        if (r.replaceVariants) {
          await tx.delete(productVariants).where(eq(productVariants.productId, pid!));
          if (v.variants.length) {
            await tx.insert(productVariants).values(
              v.variants.map((x, i) => ({ productId: pid!, optionType: x.optionType, label: x.label, sku: x.sku || null, pricePaise: x.price, stockQty: x.stockQty, sortOrder: i })),
            );
            await tx
              .update(products)
              .set({ stockQty: v.variants.reduce((s, x) => s + x.stockQty, 0) })
              .where(eq(products.id, pid!));
          }
        }
      }
    });
  } catch (e) {
    console.error("importProducts", e);
    return { message: "Import failed and was rolled back — no changes were made." };
  }
  revalidatePath("/admin/products");
  return { mode: "done", ...summary, errors: [] };
}

/* ───────────── Orders ───────────── */

const orderUpdate = z.object({
  id: z.uuid(),
  status: z.enum(["pending", "confirmed", "packed", "shipped", "delivered", "completed", "cancelled"]),
  note: z.string().max(300).optional().transform((v) => clean(v ?? "")),
  paymentStatus: z.enum(["unpaid", "partially_paid", "paid", "refunded"]),
  paymentProvider: z.string().max(40).optional().transform((v) => clean(v ?? "") || null),
  paymentRef: z.string().max(80).optional().transform((v) => clean(v ?? "") || null),
  courier: z.string().max(60).optional().transform((v) => clean(v ?? "") || null),
  trackingNumber: z.string().max(60).optional().transform((v) => clean(v ?? "") || null),
  shipping: z.coerce.number().min(0).max(100000),
  discount: z.coerce.number().min(0).max(1000000),
  adminNotes: z.string().max(2000).optional().transform((v) => clean(v ?? "") || null),
});

export type OrderUpdateState = { ok?: boolean; message?: string };

export async function updateOrder(_prev: OrderUpdateState, fd: FormData): Promise<OrderUpdateState> {
  await requireAdmin();
  const parsed = orderUpdate.safeParse(Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string")));
  if (!parsed.success) return { message: parsed.error.issues[0].message };
  const v = parsed.data;

  try {
    const msg = await db.transaction(async (tx) => {
      const [o] = await tx.select().from(orders).where(eq(orders.id, v.id)).for("update");
      if (!o) throw new Error("Order not found.");
      const changing = v.status !== o.status;
      if (changing && !ORDER_TRANSITIONS[o.status].includes(v.status as OrderStatus))
        throw new Error(`Can't move an order from "${o.status}" to "${v.status}".`);

      let stockDeducted = o.stockDeducted;
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, o.id));
      const real = items.filter((i) => !i.isDemo && i.productId);

      // Deduct stock when confirmed; restore when a confirmed order is cancelled.
      if (changing && v.status === "confirmed" && !stockDeducted) {
        for (const i of real) {
          const [p] = await tx.select().from(products).where(eq(products.id, i.productId!)).for("update");
          if (!p || !p.trackStock) continue;
          if (i.variantId) {
            const [vr] = await tx.select().from(productVariants).where(eq(productVariants.id, i.variantId)).for("update");
            if (!vr || vr.stockQty < i.quantity) throw new Error(`Not enough stock for ${i.productName} (${i.variantLabel}).`);
            await tx.update(productVariants).set({ stockQty: sql`${productVariants.stockQty} - ${i.quantity}` }).where(eq(productVariants.id, vr.id));
          } else if (p.stockQty < i.quantity) throw new Error(`Not enough stock for ${i.productName}.`);
          await tx.update(products).set({ stockQty: sql`greatest(${products.stockQty} - ${i.quantity}, 0)`, updatedAt: new Date() }).where(eq(products.id, p.id));
        }
        stockDeducted = true;
      }
      if (changing && v.status === "cancelled" && stockDeducted) {
        for (const i of real) {
          if (i.variantId) await tx.update(productVariants).set({ stockQty: sql`${productVariants.stockQty} + ${i.quantity}` }).where(eq(productVariants.id, i.variantId));
          await tx.update(products).set({ stockQty: sql`${products.stockQty} + ${i.quantity}`, updatedAt: new Date() }).where(eq(products.id, i.productId!));
        }
        stockDeducted = false;
      }

      const shippingPaise = Math.round(v.shipping * 100);
      const discountPaise = Math.round(v.discount * 100);
      await tx
        .update(orders)
        .set({
          status: v.status as OrderStatus,
          stockDeducted,
          paymentStatus: v.paymentStatus,
          paymentProvider: v.paymentProvider,
          paymentRef: v.paymentRef,
          courier: v.courier,
          trackingNumber: v.trackingNumber,
          shippingPaise,
          discountPaise,
          totalPaise: Math.max(0, o.subtotalPaise + shippingPaise - discountPaise),
          adminNotes: v.adminNotes,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, o.id));
      if (changing || v.note) await tx.insert(orderEvents).values({ orderId: o.id, status: v.status as OrderStatus, note: v.note || null });
      return changing ? `Order moved to ${v.status}.` : "Order updated.";
    });
    revalidatePath(`/admin/orders/${v.id}`);
    return { ok: true, message: msg };
  } catch (e) {
    return { message: e instanceof Error ? e.message : "Update failed." };
  }
}

/* ───────────── Enquiries ───────────── */

export async function updateEnquiry(fd: FormData) {
  await requireAdmin();
  const p = z
    .object({ id: z.uuid(), status: z.enum(["new", "in_progress", "closed"]), adminNotes: z.string().max(2000).optional() })
    .safeParse({ id: fd.get("id"), status: fd.get("status"), adminNotes: fd.get("adminNotes") ?? undefined });
  if (!p.success) return;
  await db
    .update(enquiries)
    .set({ status: p.data.status, adminNotes: p.data.adminNotes ? clean(p.data.adminNotes) : null, updatedAt: new Date() })
    .where(eq(enquiries.id, p.data.id));
  revalidatePath("/admin/enquiries");
}
