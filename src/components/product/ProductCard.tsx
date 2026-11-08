import Link from "next/link";
import type { ProductWithCategory } from "@/lib/data/catalog";
import { availability } from "@/lib/availability";
import { discountPct, formatPaise } from "@/lib/money";
import { ProductMedia } from "./ProductMedia";
import { WishlistButton } from "./WishlistButton";
import { shapeForCategory } from "@/components/fabric/FabricArt";

export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-gold/60 bg-ivory/90 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-gold-deep backdrop-blur ${className}`}
      title="Demonstration listing — illustrative product, not current stock"
    >
      Demo
    </span>
  );
}

export function ProductCard({ p, priority = false }: { p: ProductWithCategory; priority?: boolean }) {
  const off = discountPct(p.pricePaise, p.mrpPaise);
  const avail = availability(p);
  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem] bg-cream">
        <Link href={`/product/${p.slug}`} className="absolute inset-0" tabIndex={-1} aria-hidden>
          <div className="absolute inset-0 transition-transform duration-[1.4s] ease-[var(--ease-silk)] group-hover:scale-[1.06]">
            <ProductMedia p={p} priority={priority} />
          </div>
          {p.images.length !== 1 && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
              <ProductMedia p={p} view="detail" index={1} />
            </div>
          )}
        </Link>
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            {p.isDemo && <DemoBadge />}
            {off > 0 && (
              <span className="inline-flex w-fit rounded-full bg-maroon px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ivory">
                {off}% off
              </span>
            )}
          </div>
          <div className="pointer-events-auto">
            <WishlistButton
              item={{
                productId: p.id,
                slug: p.slug,
                name: p.name,
                pricePaise: p.pricePaise,
                saleUnit: p.saleUnit,
                isDemo: p.isDemo,
                categoryName: p.category.name,
                art: { pattern: p.artPattern, colors: p.artColors, shape: shapeForCategory(p.category.slug) },
                image: p.images[0] ?? null,
              }}
            />
          </div>
        </div>
        {p.saleUnit === "metre" && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-charcoal/85 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-ivory">
            Sold by the metre
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1.5 px-0.5">
        <p className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-stone">{p.category.name}</p>
        <h3 className="font-display text-[1.25rem] leading-snug text-charcoal">
          <Link href={`/product/${p.slug}`} className="link-underline focus-visible:outline-none">
            <span className="absolute inset-0 z-[1]" aria-hidden />
            {p.name}
          </Link>
        </h3>
        <p className="text-xs text-stone">{[p.fabric, p.colour].filter(Boolean).join(" · ")}</p>
        <p className="flex items-baseline gap-2 pt-1">
          <span className="text-[0.98rem] font-semibold text-maroon">
            {formatPaise(p.pricePaise)}
            {p.saleUnit === "metre" && <span className="text-xs font-medium text-stone"> / metre</span>}
          </span>
          {p.mrpPaise && p.mrpPaise > p.pricePaise && (
            <span className="text-xs text-stone line-through" aria-label={`Was ${formatPaise(p.mrpPaise)}`}>
              {formatPaise(p.mrpPaise)}
            </span>
          )}
        </p>
        {!p.isDemo && avail.state !== "in" && (
          <p className={`text-xs font-medium ${avail.state === "out" ? "text-danger" : "text-gold-deep"}`}>{avail.label}</p>
        )}
      </div>
    </article>
  );
}
