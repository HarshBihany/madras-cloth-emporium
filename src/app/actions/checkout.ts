"use server";

import { randomInt } from "node:crypto";
import { inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { orderEvents, orderItems, orders, products, productVariants } from "@/lib/db/schema";
import { indianPhone, optionalEmail, optionalText, text, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { rateLimit, pruneRateLimits } from "@/lib/rate-limit";
import { formatPaise, formatQty, isValidQty, lineTotal } from "@/lib/money";
import { business, siteUrl, whatsappUrl } from "@/lib/config";
import { notifyOwner } from "@/lib/integrations/email";

const lineSchema = z.object({
  productId: z.uuid(),
  variantId: z.uuid().nullable(),
  qty: z.number().positive().max(200),
});

const checkoutSchema = z
  .object({
    name: text(80, 2),
    phone: indianPhone,
    email: optionalEmail,
    fulfilment: z.enum(["pickup", "delivery"]),
    addressLine: optionalText(240),
    city: optionalText(60),
    state: optionalText(60),
    pincode: optionalText(10).transform((x) => x.replace(/\s/g, "")),
    notes: optionalText(600),
    consent: z.boolean().refine((x) => x, "Please agree so we can contact you about this order"),
    website: z.string().max(0).optional(), // honeypot
    lines: z.array(lineSchema).min(1, "Your bag is empty").max(50),
  })
  .superRefine((v, ctx) => {
    if (v.fulfilment === "delivery") {
      if (v.city.length < 2) ctx.addIssue({ code: "custom", path: ["city"], message: "City is required for delivery" });
      if (!/^[1-9]\d{5}$/.test(v.pincode)) ctx.addIssue({ code: "custom", path: ["pincode"], message: "Enter a valid 6-digit PIN code" });
      if (v.addressLine.length < 6) ctx.addIssue({ code: "custom", path: ["addressLine"], message: "Please enter your delivery address" });
    }
  });

export type CheckoutInput = z.input<typeof checkoutSchema>;

export type CheckoutResult =
  | { ok: true; orderNumber: string; whatsappUrl: string; totalPaise: number; message: string }
  | { ok: false; error: string; fieldErrors?: FieldErrors; lineErrors?: Record<string, string> };

function makeOrderNumber() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rand = Array.from({ length: 5 }, () => alphabet[randomInt(alphabet.length)]).join("");
  return `MCE-${ymd}-${rand}`;
}

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fe = toFieldErrors(parsed.error);
    if (fe.website) return { ok: false, error: "Unable to submit." };
    return { ok: false, error: fe.lines ?? "Please check the highlighted fields.", fieldErrors: fe };
  }
  const v = parsed.data;

  if (!(await rateLimit("order", 6, 60 * 30))) {
    return { ok: false, error: "Too many orders from this connection. Please message us on WhatsApp directly." };
  }
  void pruneRateLimits();

  // Re-price every line from the database — never trust client prices.
  const productIds = [...new Set(v.lines.map((l) => l.productId))];
  const [prodRows, varRows] = await Promise.all([
    db.select().from(products).where(inArray(products.id, productIds)),
    db.select().from(productVariants).where(inArray(productVariants.productId, productIds)),
  ]);
  const pMap = new Map(prodRows.map((p) => [p.id, p]));
  const lineErrors: Record<string, string> = {};
  const priced: {
    key: string;
    product: (typeof prodRows)[number];
    variant: (typeof varRows)[number] | null;
    qty: number;
    unit: number;
    total: number;
  }[] = [];

  for (const l of v.lines) {
    const key = `${l.productId}:${l.variantId ?? ""}`;
    const p = pMap.get(l.productId);
    if (!p || p.status !== "active") {
      lineErrors[key] = "This item is no longer available.";
      continue;
    }
    const variants = varRows.filter((x) => x.productId === p.id);
    const variant = l.variantId ? (variants.find((x) => x.id === l.variantId) ?? null) : null;
    if (variants.length && !variant) {
      lineErrors[key] = "Please choose a size/option for this item.";
      continue;
    }
    if (!isValidQty(l.qty, p.minQty, p.qtyStep)) {
      lineErrors[key] = `Quantity must be at least ${p.minQty}, in steps of ${p.qtyStep}.`;
      continue;
    }
    if (!p.isDemo && p.trackStock) {
      const stock = variant ? variant.stockQty : p.stockQty;
      if (l.qty > stock) {
        lineErrors[key] = stock > 0 ? `Only ${formatQty(p.saleUnit, stock)} available.` : "Currently out of stock.";
        continue;
      }
    }
    const unit = variant?.pricePaise ?? p.pricePaise;
    priced.push({ key, product: p, variant, qty: l.qty, unit, total: lineTotal(unit, l.qty) });
  }

  if (Object.keys(lineErrors).length) {
    return { ok: false, error: "Some items in your bag need attention.", lineErrors };
  }

  const subtotal = priced.reduce((s, x) => s + x.total, 0);
  const containsDemo = priced.some((x) => x.product.isDemo);

  let orderNumber = makeOrderNumber();
  let orderId: string | null = null;
  for (let attempt = 0; attempt < 3 && !orderId; attempt++) {
    try {
      orderId = await db.transaction(async (tx) => {
        const [o] = await tx
          .insert(orders)
          .values({
            orderNumber,
            status: "pending",
            channel: "whatsapp",
            fulfilment: v.fulfilment,
            customerName: v.name,
            phone: v.phone,
            email: v.email || null,
            addressLine: v.fulfilment === "delivery" ? v.addressLine : null,
            city: v.city || null,
            state: v.state || null,
            pincode: v.pincode || null,
            customerNotes: v.notes || null,
            subtotalPaise: subtotal,
            totalPaise: subtotal,
            containsDemoItems: containsDemo,
          })
          .returning({ id: orders.id });
        await tx.insert(orderItems).values(
          priced.map((x) => ({
            orderId: o.id,
            productId: x.product.id,
            variantId: x.variant?.id ?? null,
            productName: x.product.name,
            productSlug: x.product.slug,
            variantLabel: x.variant?.label ?? null,
            saleUnit: x.product.saleUnit,
            quantity: x.qty,
            unitPricePaise: x.unit,
            lineTotalPaise: x.total,
            isDemo: x.product.isDemo,
            hsnCode: x.product.hsnCode,
            gstRatePct: x.product.gstRatePct,
          })),
        );
        await tx.insert(orderEvents).values({ orderId: o.id, status: "pending", note: "Order request created from website cart" });
        return o.id;
      });
    } catch (e) {
      if (String(e).includes("order_number")) orderNumber = makeOrderNumber();
      else {
        console.error("placeOrder failed", e);
        return { ok: false, error: "We couldn't save your order. Please try again or message us on WhatsApp." };
      }
    }
  }
  if (!orderId) return { ok: false, error: "We couldn't save your order. Please try again." };

  const lines = priced.map(
    (x, i) =>
      `${i + 1}. ${x.product.name}${x.variant ? ` (${x.variant.label})` : ""}${x.product.isDemo ? " [demo listing]" : ""} — ${formatQty(x.product.saleUnit, x.qty)} × ${formatPaise(x.unit)} = ${formatPaise(x.total)}`,
  );
  const message = [
    `*Order request ${orderNumber}*`,
    `${business.name} website`,
    "",
    ...lines,
    "",
    `*Subtotal: ${formatPaise(subtotal)}*`,
    "",
    `Name: ${v.name}`,
    `Phone: ${v.phone}`,
    v.fulfilment === "pickup" ? "Collection: Store pickup (Chas)" : `Delivery: ${v.addressLine}, ${v.city}${v.state ? `, ${v.state}` : ""} – ${v.pincode}`,
    ...(v.notes ? [`Note: ${v.notes}`] : []),
    ...(containsDemo ? ["", "(Includes demo listings — please suggest similar pieces in stock.)"] : []),
    "",
    "Please confirm availability, final price & delivery. Thank you!",
    `Track: ${siteUrl}/track`,
  ].join("\n");

  void notifyOwner(`New order request ${orderNumber} — ${formatPaise(subtotal)}`, message);

  return { ok: true, orderNumber, whatsappUrl: whatsappUrl(message), totalPaise: subtotal, message };
}
