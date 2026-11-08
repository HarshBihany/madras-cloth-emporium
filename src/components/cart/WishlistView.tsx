"use client";

import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { useHydrated, useWishlist } from "@/lib/store/cart";
import { FabricArt, type ArtShape } from "@/components/fabric/FabricArt";
import { formatPaise } from "@/lib/money";
import { siteUrl, whatsappUrl } from "@/lib/config";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";
import { DemoBadge } from "@/components/product/ProductCard";

export function WishlistView() {
  const hydrated = useHydrated();
  const { items, remove } = useWishlist();
  if (!hydrated) return <div className="mt-12 h-64 animate-pulse rounded-3xl bg-cream" aria-hidden />;
  if (!items.length)
    return (
      <div className="mt-12 rounded-[2rem] border border-dashed border-sand-deep p-12 text-center">
        <p className="font-display text-3xl">Nothing saved yet.</p>
        <p className="mt-2 text-charcoal-soft">Tap the heart on any piece to keep it here.</p>
        <Link href="/shop" className="btn btn-primary mt-6">
          Browse the collection
        </Link>
      </div>
    );

  const share = `My wishlist from Madras Cloth Emporium:\n${items.map((i) => `• ${i.name} — ${siteUrl}/product/${i.slug}`).join("\n")}`;

  return (
    <>
      <a href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-6">
        <WhatsAppIcon className="h-5 w-5" /> Share with family
      </a>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
        {items.map((i) => (
          <li key={i.productId} className="group relative">
            <Link href={`/product/${i.slug}`} className="block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem] bg-cream">
                {i.image ? (
                  <Image src={i.image} alt={i.name} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
                ) : (
                  <FabricArt seed={i.slug} pattern={i.art.pattern} colors={i.art.colors} shape={i.art.shape as ArtShape} className="h-full w-full" />
                )}
                {i.isDemo && <DemoBadge className="absolute left-3 top-3" />}
              </div>
              <p className="mt-3 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-stone">{i.categoryName}</p>
              <h2 className="font-display text-xl leading-snug">{i.name}</h2>
              <p className="mt-1 text-sm font-semibold text-maroon">
                {formatPaise(i.pricePaise)}
                {i.saleUnit === "metre" && <span className="font-normal text-stone"> / metre</span>}
              </p>
            </Link>
            <div className="mt-3 flex gap-2">
              <a href={whatsappUrl(`Hello! Is "${i.name}" available?\n${siteUrl}/product/${i.slug}`)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp !min-h-9 flex-1 !px-3 !py-1 !text-[0.62rem]">
                Ask
              </a>
              <button type="button" onClick={() => remove(i.productId)} className="btn btn-outline !min-h-9 !px-3 !py-1" aria-label={`Remove ${i.name} from wishlist`}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
