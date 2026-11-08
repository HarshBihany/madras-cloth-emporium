import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Info, Truck, Scissors, Ruler } from "lucide-react";
import { getProductBySlug, getRelated } from "@/lib/data/catalog";
import { discountPct, formatPaise } from "@/lib/money";
import { Gallery } from "@/components/product/Gallery";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductCard, DemoBadge } from "@/components/product/ProductCard";
import { WishlistButton } from "@/components/product/WishlistButton";
import { shapeForCategory } from "@/components/fabric/FabricArt";
import { JsonLd, breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { business } from "@/lib/config";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Product not found" };
  const desc = `${p.name} — ${[p.fabric, p.colour, p.occasion].filter(Boolean).join(", ")}. ${formatPaise(p.pricePaise)}${p.saleUnit === "metre" ? " per metre" : ""}. ${business.name}, Chas, Bokaro.`;
  return {
    title: `${p.name}${p.isDemo ? " (Demo)" : ""}`,
    description: desc,
    alternates: { canonical: `/product/${p.slug}` },
    // Demo listings must never appear in search results as real products
    robots: p.isDemo ? { index: false, follow: true } : undefined,
    openGraph: { title: p.name, description: desc, images: p.images.length ? [p.images[0]] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();
  const related = await getRelated(p);
  const off = discountPct(p.pricePaise, p.mrpPaise);
  const shape = shapeForCategory(p.category.slug);

  const details: [string, string][] = [
    ["Fabric", p.fabric],
    ["Colour", p.colour],
    ["Occasion", p.occasion],
    ["Work", p.work],
    ["Width", p.widthInches ? `${p.widthInches}″` : ""],
    ["Sold", p.saleUnit === "metre" ? `By the metre (min ${p.minQty} m, steps of ${p.qtyStep} m)` : "Per piece"],
    ...Object.entries(p.attributes),
    ["SKU", p.sku ?? ""],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <>
      <div className="container-x pb-20 pt-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-stone">
            <li>
              <Link href="/" className="link-underline">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/collections/${p.category.slug}`} className="link-underline">
                {p.category.name}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-charcoal">
              {p.name}
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-28">
              <Gallery p={p} />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <p className="eyebrow">{p.category.name}</p>
              {p.isDemo && <DemoBadge />}
            </div>
            <h1 className="mt-3 text-4xl leading-[1.05] sm:text-5xl">{p.name}</h1>
            {p.shortDescription && <p className="mt-3 text-charcoal-soft">{p.shortDescription}</p>}

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-4xl text-maroon">{formatPaise(p.pricePaise)}</span>
              {p.saleUnit === "metre" && <span className="text-stone">per metre</span>}
              {p.mrpPaise && p.mrpPaise > p.pricePaise && (
                <>
                  <span className="text-stone line-through">{formatPaise(p.mrpPaise)}</span>
                  <span className="rounded-full bg-maroon px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ivory">{off}% off</span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-stone">Final price, taxes and delivery confirmed with you on WhatsApp before payment.</p>

            {p.isDemo && (
              <div className="mt-6 flex gap-3 rounded-2xl border border-gold/50 bg-gold-pale/40 p-4 text-sm text-charcoal-soft">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" aria-hidden />
                <p>
                  <strong className="text-charcoal">Demonstration listing.</strong> This product, its price and artwork are illustrative examples of how the
                  catalogue will look — it is not current stock. Ask us on WhatsApp for similar pieces in the store today.
                </p>
              </div>
            )}

            <div className="gold-rule my-8" />

            <BuyBox
              p={{
                id: p.id,
                slug: p.slug,
                name: p.name,
                saleUnit: p.saleUnit,
                pricePaise: p.pricePaise,
                minQty: p.minQty,
                qtyStep: p.qtyStep,
                stockQty: p.stockQty,
                trackStock: p.trackStock,
                lowStockThreshold: p.lowStockThreshold,
                isDemo: p.isDemo,
                images: p.images,
                artPattern: p.artPattern,
                artColors: p.artColors,
                shape,
                variants: p.variants.map((v) => ({ id: v.id, label: v.label, optionType: v.optionType, pricePaise: v.pricePaise, stockQty: v.stockQty })),
              }}
            />

            <div className="mt-4">
              <WishlistButton
                variant="full"
                item={{
                  productId: p.id,
                  slug: p.slug,
                  name: p.name,
                  pricePaise: p.pricePaise,
                  saleUnit: p.saleUnit,
                  isDemo: p.isDemo,
                  categoryName: p.category.name,
                  art: { pattern: p.artPattern, colors: p.artColors, shape },
                  image: p.images[0] ?? null,
                }}
              />
            </div>

            <div className="mt-10 divide-y divide-sand border-y border-sand">
              <details open className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-display text-2xl">
                  Details <span className="text-gold-deep transition group-open:rotate-45">+</span>
                </summary>
                {p.description && !p.isDemo && <p className="mt-4 whitespace-pre-line leading-relaxed text-charcoal-soft">{p.description}</p>}
                <dl className="mt-4 grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2.5 text-sm">
                  {details.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-stone">{k}</dt>
                      <dd className="text-charcoal">{v}</dd>
                    </div>
                  ))}
                </dl>
              </details>
              {p.care && (
                <details className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-display text-2xl">
                    Care <span className="text-gold-deep transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-charcoal-soft">{p.care}</p>
                </details>
              )}
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-display text-2xl">
                  Delivery & services <span className="text-gold-deep transition group-open:rotate-45">+</span>
                </summary>
                <ul className="mt-4 space-y-3 text-sm text-charcoal-soft">
                  <li className="flex gap-3">
                    <Truck className="h-4 w-4 shrink-0 text-gold-deep" aria-hidden /> Store pickup in Chas, or pan-India delivery on request — charges confirmed on WhatsApp.
                  </li>
                  <li className="flex gap-3">
                    <Scissors className="h-4 w-4 shrink-0 text-gold-deep" aria-hidden />
                    <span>
                      Need it stitched?{" "}
                      <Link href={`/tailoring?product=${p.slug}`} className="link-underline text-maroon">
                        Request custom tailoring
                      </Link>
                      .
                    </span>
                  </li>
                  {p.saleUnit === "metre" && (
                    <li className="flex gap-3">
                      <Ruler className="h-4 w-4 shrink-0 text-gold-deep" aria-hidden />
                      <span>
                        Not sure how much? Use our{" "}
                        <Link href="/#metre-title" className="link-underline text-maroon">
                          metre guide
                        </Link>
                        .
                      </span>
                    </li>
                  )}
                </ul>
              </details>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-sand bg-ivory-deep py-16 sm:py-20" aria-labelledby="related-title">
          <div className="container-x">
            <h2 id="related-title" className="text-4xl sm:text-5xl">
              You may also <em className="text-maroon">love</em>
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {related.map((r) => (
                <ProductCard key={r.id} p={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {!p.isDemo && <JsonLd data={productJsonLd(p)} />}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: p.category.name, path: `/collections/${p.category.slug}` },
          { name: p.name, path: `/product/${p.slug}` },
        ])}
      />
    </>
  );
}
