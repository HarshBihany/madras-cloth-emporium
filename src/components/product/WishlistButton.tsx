"use client";

import { Heart } from "lucide-react";
import { useHydrated, useWishlist, type WishItem } from "@/lib/store/cart";

export function WishlistButton({ item, variant = "icon" }: { item: WishItem; variant?: "icon" | "full" }) {
  const hydrated = useHydrated();
  const active = useWishlist((s) => s.items.some((i) => i.productId === item.productId));
  const toggle = useWishlist((s) => s.toggle);
  const on = hydrated && active;

  if (variant === "full")
    return (
      <button type="button" onClick={() => toggle(item)} aria-pressed={on} className="btn btn-outline w-full sm:w-auto">
        <Heart className={`h-4 w-4 ${on ? "fill-maroon text-maroon" : ""}`} aria-hidden />
        {on ? "Saved to wishlist" : "Save to wishlist"}
      </button>
    );

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-pressed={on}
      aria-label={on ? `Remove ${item.name} from wishlist` : `Save ${item.name} to wishlist`}
      className="relative z-[2] inline-flex h-10 w-10 items-center justify-center rounded-full bg-ivory/90 text-charcoal shadow-sm backdrop-blur transition hover:scale-105 hover:bg-ivory"
    >
      <Heart className={`h-[1.1rem] w-[1.1rem] transition ${on ? "fill-maroon text-maroon" : ""}`} aria-hidden />
    </button>
  );
}
