import type { Metadata } from "next";
import { WishlistView } from "@/components/cart/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <div className="container-x pb-24 pt-10 sm:pt-14">
      <p className="eyebrow">Saved for later</p>
      <h1 className="mt-3 text-5xl sm:text-6xl">
        Your <em className="text-maroon">wishlist</em>
      </h1>
      <p className="mt-4 max-w-2xl text-charcoal-soft">Saved on this device. Share it with family on WhatsApp to decide together.</p>
      <WishlistView />
    </div>
  );
}
