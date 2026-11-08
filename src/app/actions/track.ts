"use server";

import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { orderEvents, orderItems, orders, type OrderStatus } from "@/lib/db/schema";
import { indianPhone } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export type TrackState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "found";
      order: {
        orderNumber: string;
        status: OrderStatus;
        fulfilment: string;
        totalPaise: number;
        courier: string | null;
        trackingNumber: string | null;
        createdAt: string;
        items: { name: string; qty: number; unit: string; variant: string | null }[];
        events: { status: OrderStatus; note: string | null; at: string }[];
      };
    };

const schema = z.object({
  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^MCE-\d{6}-[A-Z0-9]{5}$/, "Enter your order reference, e.g. MCE-241108-AB2CD"),
  phone: indianPhone,
});

/** Requires BOTH order number and phone — so references alone can't reveal orders. */
export async function trackOrder(_prev: TrackState, fd: FormData): Promise<TrackState> {
  const parsed = schema.safeParse({ orderNumber: fd.get("orderNumber") ?? "", phone: fd.get("phone") ?? "" });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  if (!(await rateLimit("track", 15, 60 * 15))) return { status: "error", message: "Too many attempts. Please try again later." };

  const [o] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.orderNumber, parsed.data.orderNumber), eq(orders.phone, parsed.data.phone)))
    .limit(1);
  if (!o) return { status: "error", message: "We couldn't find an order with that reference and phone number." };

  const [items, events] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, o.id)),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, o.id)).orderBy(asc(orderEvents.createdAt)),
  ]);
  return {
    status: "found",
    order: {
      orderNumber: o.orderNumber,
      status: o.status,
      fulfilment: o.fulfilment,
      totalPaise: o.totalPaise,
      courier: o.courier,
      trackingNumber: o.trackingNumber,
      createdAt: o.createdAt.toISOString(),
      items: items.map((i) => ({ name: i.productName, qty: i.quantity, unit: i.saleUnit, variant: i.variantLabel })),
      events: events.map((e) => ({ status: e.status, note: e.note, at: e.createdAt.toISOString() })),
    },
  };
}
