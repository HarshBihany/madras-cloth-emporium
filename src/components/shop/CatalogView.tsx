import Link from "next/link";
import { Suspense } from "react";
import { Search, X } from "lucide-react";
import { getCategories, getFacets, listProducts, type CatalogFilters } from "@/lib/data/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterPanel } from "./FilterPanel";
import { SortSelect } from "./SortSelect";
import { whatsappUrl } from "@/lib/config";

type SP = Record<string, string | string[] | undefined>;

function hrefWith(base: string, sp: SP, patch: Record<string, string | null>) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v == null) continue;
    for (const x of Array.isArray(v) ? v : [v]) next.append(k, x);
  }
  for (const [k, v] of Object.entries(patch)) {
    next.delete(k);
    if (v != null) next.set(k, v);
  }
  return `${base}${next.size ? `?${next}` : ""}`;
}

function removeValue(base: string, sp: SP, key: string, value: string) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v == null || k === "page") continue;
    for (const x of Array.isArray(v) ? v : [v]) {
      if (k === key) {
        const rest = x.split(",").filter((y) => y !== value);
        if (rest.length) next.append(k, rest.join(","));
      } else next.append(k, x);
    }
  }
  return `${base}${next.size ? `?${next}` : ""}`;
}

export async function CatalogView({
  basePath,
  filters,
  searchParams,
  fixedCategory,
}: {
  basePath: string;
  filters: CatalogFilters;
  searchParams: SP;
  fixedCategory?: { slug: string; defaultSaleUnit: "piece" | "metre" };
}) {
  const [result, facets, categories] = await Promise.all([listProducts(filters), getFacets(filters), fixedCategory ? null : getCategories()]);

  const chips: { label: string; href: string }[] = [];
  if (filters.q) chips.push({ label: `“${filters.q}”`, href: removeValue(basePath, searchParams, "q", filters.q) });
  if (!fixedCategory && filters.category) {
    const c = categories?.find((x) => x.slug === filters.category);
    chips.push({ label: c?.name ?? filters.category, href: removeValue(basePath, searchParams, "category", filters.category) });
  }
  for (const k of ["fabric", "colour", "occasion"] as const)
    for (const v of filters[k] ?? []) chips.push({ label: v, href: removeValue(basePath, searchParams, k, v) });
  if (filters.unit) chips.push({ label: filters.unit === "metre" ? "By the metre" : "Ready piece", href: removeValue(basePath, searchParams, "unit", filters.unit) });
  if (filters.min != null || filters.max != null)
    chips.push({
      label: `₹${filters.min ?? 0} – ${filters.max != null ? `₹${filters.max}` : "any"}`,
      href: hrefWith(basePath, searchParams, { min: null, max: null, page: null }),
    });
  if (filters.inStock) chips.push({ label: "In stock", href: removeValue(basePath, searchParams, "stock", "1") });

  return (
    <div className="container-x pb-24">
      <div className="sticky top-[4.5rem] z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-sand bg-ivory px-4 py-3 sm:-mx-7 sm:px-7 lg:top-20 lg:-mx-10 lg:px-10">
        <form action={basePath} method="get" role="search" className="relative order-last w-full sm:order-none sm:w-80">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" aria-hidden />
          <label htmlFor="catalog-q" className="sr-only">
            Search within catalogue
          </label>
          <input id="catalog-q" name="q" type="search" maxLength={80} defaultValue={filters.q ?? ""} placeholder="Search fabric, colour, occasion…" className="field !min-h-11 rounded-full !py-2 pl-11 text-sm" />
          {filters.category && !fixedCategory && <input type="hidden" name="category" value={filters.category} />}
        </form>
        <p className="text-sm text-stone" aria-live="polite">
          <strong className="font-semibold text-charcoal">{result.total}</strong> {result.total === 1 ? "piece" : "pieces"}
        </p>
        <div className="flex items-center gap-2">
          <Suspense>
            <div className="lg:hidden">
              <FilterPanel mode="drawer" facets={facets} showUnit={!fixedCategory} categories={categories ?? undefined} activeCategory={filters.category} />
            </div>
            <SortSelect />
          </Suspense>
        </div>
      </div>

      {chips.length > 0 && (
        <ul className="mt-5 flex flex-wrap items-center gap-2" aria-label="Active filters">
          {chips.map((c) => (
            <li key={c.label + c.href}>
              <Link href={c.href} scroll={false} className="chip !min-h-9 !py-1 text-xs" aria-label={`Remove filter ${c.label}`}>
                {c.label} <X className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </li>
          ))}
          <li>
            <Link href={basePath} className="link-underline px-2 text-xs font-semibold text-maroon">
              Clear all
            </Link>
          </li>
        </ul>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[15rem_1fr] xl:grid-cols-[16.5rem_1fr]">
        <div className="hidden lg:block">
          <div className="sticky top-40 max-h-[calc(100vh-11rem)] overflow-y-auto pb-8 pr-2">
            <Suspense>
              <FilterPanel mode="sidebar" facets={facets} showUnit={!fixedCategory} categories={categories ?? undefined} activeCategory={filters.category} />
            </Suspense>
          </div>
        </div>

        <section aria-label="Products">
          {result.items.length ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3">
              {result.items.map((p, i) => (
                <li key={p.id}>
                  <ProductCard p={p} priority={i < 3} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-3xl border border-dashed border-sand-deep p-12 text-center">
              <p className="font-display text-3xl">Nothing matches just yet.</p>
              <p className="mx-auto mt-3 max-w-md text-charcoal-soft">
                Our shelves hold much more than this website shows. Tell us what you&apos;re looking for and we&apos;ll check the store for you.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href={basePath} className="btn btn-outline">
                  Clear filters
                </Link>
                <a href={whatsappUrl(`Hello! I'm looking for ${filters.q ? `"${filters.q}"` : "something specific"}. Do you have it?`)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          )}

          {result.pages > 1 && (
            <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-2">
              {Array.from({ length: result.pages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={hrefWith(basePath, searchParams, { page: n === 1 ? null : String(n) })}
                  aria-current={n === result.page ? "page" : undefined}
                  className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-semibold ${
                    n === result.page ? "border-maroon bg-maroon text-ivory" : "border-sand hover:border-charcoal"
                  }`}
                >
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}

export function CatalogHero({ eyebrow, title, intro, crumbs }: { eyebrow: string; title: React.ReactNode; intro?: string; crumbs: { href: string; label: string }[] }) {
  return (
    <header className="container-x pb-8 pt-10 sm:pt-14">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-stone">
          {crumbs.map((c, i) => (
            <li key={c.href} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>/</span>}
              {i === crumbs.length - 1 ? (
                <span aria-current="page" className="text-charcoal">
                  {c.label}
                </span>
              ) : (
                <Link href={c.href} className="link-underline">
                  {c.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <div className="mt-6 grid items-end gap-6 lg:grid-cols-2">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">{title}</h1>
        </div>
        {intro && <p className="max-w-xl text-base leading-relaxed text-charcoal-soft lg:justify-self-end lg:text-right">{intro}</p>}
      </div>
    </header>
  );
}
