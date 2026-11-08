"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Cart lives in the browser (no account needed). Prices here are for DISPLAY ONLY —
 * the server re-prices every line from the database at checkout.
 */
export type CartLine = {
  key: string; // productId:variantId
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  variantLabel: string | null;
  saleUnit: "piece" | "metre";
  unitPricePaise: number;
  qty: number;
  minQty: number;
  qtyStep: number;
  isDemo: boolean;
  art: { pattern: string; colors: string[]; shape: string };
  image?: string | null;
};

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "key">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) =>
        set((s) => {
          const key = `${line.productId}:${line.variantId ?? ""}`;
          const existing = s.lines.find((l) => l.key === key);
          if (existing)
            return {
              lines: s.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(200, round2(l.qty + line.qty)) } : l)),
            };
          return { lines: [...s.lines, { ...line, key }].slice(-50) };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(200, Math.max(l.minQty, round2(qty))) } : l)),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "mce-cart-v1", storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);

export type WishItem = {
  productId: string;
  slug: string;
  name: string;
  pricePaise: number;
  saleUnit: "piece" | "metre";
  isDemo: boolean;
  categoryName: string;
  art: { pattern: string; colors: string[]; shape: string };
  image?: string | null;
};

type WishState = {
  items: WishItem[];
  toggle: (item: WishItem) => void;
  remove: (productId: string) => void;
};

export const useWishlist = create<WishState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (item) =>
        set((s) =>
          s.items.some((i) => i.productId === item.productId)
            ? { items: s.items.filter((i) => i.productId !== item.productId) }
            : { items: [item, ...s.items].slice(0, 100) },
        ),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
    }),
    { name: "mce-wishlist-v1", storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);

/** Avoid hydration mismatches: true only after the persisted store has loaded on the client. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
