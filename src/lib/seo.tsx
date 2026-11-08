import { business, fullAddress, siteUrl } from "@/lib/config";
import type { ProductDetail } from "@/lib/data/catalog";

/** Safely embed JSON-LD (escapes "<" to prevent script injection). */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function storeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": `${siteUrl}/#store`,
    name: business.name,
    foundingDate: String(business.established),
    url: siteUrl,
    telephone: business.phoneTel,
    email: business.email,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: `${business.address.locality}, ${business.address.city}`,
      addressRegion: business.address.state,
      ...(business.address.postalCode ? { postalCode: business.address.postalCode } : {}),
      addressCountry: business.address.country,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.mapsQuery)}`,
    description: `Family clothing emporium at ${fullAddress}, established ${business.established}.`,
  };
}

/** Product structured data — only emitted for REAL (non-demo) products. */
export function productJsonLd(p: ProductDetail) {
  const inStock = !p.trackStock || p.stockQty > 0;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku ?? undefined,
    category: p.category.name,
    description: p.shortDescription || p.description.slice(0, 300),
    material: p.fabric || undefined,
    color: p.colour || undefined,
    image: p.images.length ? p.images : undefined,
    brand: { "@type": "Brand", name: business.name },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${p.slug}`,
      priceCurrency: "INR",
      price: (p.pricePaise / 100).toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@id": `${siteUrl}/#store` },
      ...(p.saleUnit === "metre"
        ? { priceSpecification: { "@type": "UnitPriceSpecification", price: (p.pricePaise / 100).toFixed(2), priceCurrency: "INR", unitCode: "MTR" } }
        : {}),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${siteUrl}${it.path}`,
    })),
  };
}
