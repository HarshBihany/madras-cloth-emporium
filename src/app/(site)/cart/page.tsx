import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your Bag",
  robots: { index: false, follow: false },
  alternates: { canonical: "/cart" },
};

export default function CartPage() {
  return (
    <div className="container-x pb-24 pt-10 sm:pt-14">
      <p className="eyebrow">Your bag</p>
      <h1 className="mt-3 text-5xl sm:text-6xl">
        Ready to <em className="text-maroon">send</em>?
      </h1>
      <p className="mt-4 max-w-2xl text-charcoal-soft">
        Review your pieces, add your details, and we&apos;ll open WhatsApp with your order ready to send. Our team confirms availability,
        final price, payment and delivery with you personally — nothing is charged online.
      </p>
      <CartView />
    </div>
  );
}
