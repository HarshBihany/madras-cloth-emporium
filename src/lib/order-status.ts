import type { OrderStatus } from "@/lib/db/schema";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Received",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Allowed admin transitions (keeps stock accounting consistent). */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "shipped", "completed", "cancelled"],
  packed: ["shipped", "completed", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  completed: [],
  cancelled: [],
};
