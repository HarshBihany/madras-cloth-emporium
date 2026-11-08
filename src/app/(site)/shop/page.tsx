import type { Metadata } from "next";
import { CatalogHero, CatalogView } from "@/components/shop/CatalogView";
import { parseFilters } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Object.keys(sp).length > 0;
  return {
    title: "Shop All — Sarees, Suits, Kurtis, Shirting & Suiting",
    description: "Browse sarees, suits & dress materials, kurtis, shirting and suiting fabrics from Madras Cloth Emporium, Chas, Bokaro. Filter by fabric, colour, occasion and price.",
    alternates: { canonical: "/shop" },
    // Avoid indexing thousands of filter combinations
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  return (
    <>
      <CatalogHero
        eyebrow={filters.q ? "Search" : "The full emporium"}
        title={filters.q ? <>Results for <em className="text-maroon">“{filters.q}”</em></> : <>Every counter, <em className="text-maroon">one place</em>.</>}
        intro="Sarees, suits, kurtis and cloth by the metre. Can't find it? Our store holds far more — just ask on WhatsApp."
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/shop", label: "Shop" },
        ]}
      />
      <CatalogView basePath="/shop" filters={filters} searchParams={sp} />
    </>
  );
}
