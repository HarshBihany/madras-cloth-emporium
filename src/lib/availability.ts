import type { Product, ProductVariant } from "@/lib/db/schema";

type P = Pick<Product, "isDemo" | "trackStock" | "stockQty" | "lowStockThreshold" | "saleUnit">;

/** Stock/availability label. Demo products NEVER claim to be in stock. */
export function availability(p: P, variant?: Pick<ProductVariant, "stockQty"> | null) {
  if (p.isDemo) return { state: "demo" as const, label: "Demo listing — availability on request" };
  if (!p.trackStock) return { state: "in" as const, label: "Available — confirm on WhatsApp" };
  const qty = variant ? variant.stockQty : p.stockQty;
  if (qty <= 0) return { state: "out" as const, label: "Currently out of stock — enquire for restock" };
  if (qty <= p.lowStockThreshold)
    return { state: "low" as const, label: p.saleUnit === "metre" ? `Only ${qty} m left` : `Only ${qty} left` };
  return { state: "in" as const, label: "In stock" };
}
