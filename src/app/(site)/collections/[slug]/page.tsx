import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogHero, CatalogView } from "@/components/shop/CatalogView";
import { getCategory, parseFilters } from "@/lib/data/catalog";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { business } from "@/lib/config";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCategory(slug);
  if (!c) return {};
  const filtered = Object.keys(await searchParams).length > 0;
  return {
    title: `${c.name} in Chas, Bokaro`,
    description: `${c.description} Shop ${c.name.toLowerCase()} at ${business.name}, Bypass Road, Chas — order on WhatsApp.`,
    alternates: { canonical: `/collections/${c.slug}` },
    robots: filtered ? { index: false, follow: true } : undefined,
    openGraph: { title: `${c.name} | ${business.name}`, description: c.description },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const c = await getCategory(slug);
  if (!c) notFound();
  const sp = await searchParams;
  const filters = parseFilters(sp, c.slug);
  const [first, ...rest] = c.name.split(" ");
  return (
    <>
      <CatalogHero
        eyebrow={c.tagline}
        title={
          <>
            {first} <em className="text-maroon">{rest.join(" ")}</em>
          </>
        }
        intro={c.description}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/shop", label: "Shop" },
          { href: `/collections/${c.slug}`, label: c.name },
        ]}
      />
      <CatalogView basePath={`/collections/${c.slug}`} filters={filters} searchParams={sp} fixedCategory={c} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: c.name, path: `/collections/${c.slug}` },
        ])}
      />
    </>
  );
}
