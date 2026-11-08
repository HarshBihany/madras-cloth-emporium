"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";

type Facet = { value: string; count: number };

const PRICE_PRESETS = [
  { label: "Under ₹500", min: "", max: "500" },
  { label: "₹500 – ₹1,500", min: "500", max: "1500" },
  { label: "₹1,500 – ₹3,000", min: "1500", max: "3000" },
  { label: "₹3,000 – ₹6,000", min: "3000", max: "6000" },
  { label: "Above ₹6,000", min: "6000", max: "" },
];

/**
 * GET form that works without JS; with JS it updates the URL instantly on change.
 */
export function FilterPanel({
  facets,
  showUnit,
  categories,
  activeCategory,
  mode,
}: {
  mode: "sidebar" | "drawer";
  facets: { fabric: Facet[]; colour: Facet[]; occasion: Facet[] };
  showUnit: boolean;
  categories?: { slug: string; name: string; productCount: number }[];
  activeCategory?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const selected = (k: string) => new Set(sp.getAll(k).flatMap((v) => v.split(",")));

  const apply = () => {
    const fd = new FormData(formRef.current!);
    const next = new URLSearchParams();
    for (const [k, v] of fd.entries()) if (typeof v === "string" && v && k !== "price") next.append(k, v);
    for (const k of ["q", "sort"]) {
      const v = sp.get(k);
      if (v && !next.has(k)) next.set(k, v);
    }
    next.delete("page");
    start(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  const priceKey = `${sp.get("min") ?? ""}-${sp.get("max") ?? ""}`;

  const body = (
    <form ref={formRef} method="get" action={pathname} onChange={apply} onSubmit={(e) => (e.preventDefault(), apply())} className="space-y-8">
      {sp.get("q") && <input type="hidden" name="q" value={sp.get("q")!} />}
      {sp.get("sort") && <input type="hidden" name="sort" value={sp.get("sort")!} />}

      {categories && (
        <fieldset>
          <legend className="field-label">Category</legend>
          <div className="mt-1 space-y-1">
            <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-cream">
              <span className="flex items-center gap-3">
                <input type="radio" name="category" value="" defaultChecked={!activeCategory} className="accent-maroon" />
                All
              </span>
            </label>
            {categories.map((c) => (
              <label key={c.slug} className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-cream">
                <span className="flex items-center gap-3">
                  <input type="radio" name="category" value={c.slug} defaultChecked={activeCategory === c.slug} className="accent-maroon" />
                  {c.name}
                </span>
                <span className="text-xs text-stone">{c.productCount}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="field-label">Price</legend>
        <div className="mt-1 space-y-1" key={priceKey}>
          {PRICE_PRESETS.map((p) => {
            const id = `${mode}-price-${p.min}-${p.max}`;
            const checked = (sp.get("min") ?? "") === p.min && (sp.get("max") ?? "") === p.max;
            return (
              <label key={id} htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-cream">
                <input
                  id={id}
                  type="radio"
                  name="price"
                  defaultChecked={checked}
                  className="accent-maroon"
                  onChange={() => {
                    const f = formRef.current!;
                    (f.elements.namedItem("min") as HTMLInputElement).value = p.min;
                    (f.elements.namedItem("max") as HTMLInputElement).value = p.max;
                  }}
                />
                {p.label}
              </label>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor={`${mode}-min`}>
            Minimum price (₹)
          </label>
          <input id={`${mode}-min`} name="min" inputMode="numeric" pattern="[0-9]*" placeholder="Min ₹" defaultValue={sp.get("min") ?? ""} className="field !min-h-10 !py-2 text-sm" key={`min-${priceKey}`} />
          <label className="sr-only" htmlFor={`${mode}-max`}>
            Maximum price (₹)
          </label>
          <input id={`${mode}-max`} name="max" inputMode="numeric" pattern="[0-9]*" placeholder="Max ₹" defaultValue={sp.get("max") ?? ""} className="field !min-h-10 !py-2 text-sm" key={`max-${priceKey}`} />
        </div>
      </fieldset>

      {showUnit && (
        <fieldset>
          <legend className="field-label">Buy</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {[
              ["", "Any"],
              ["piece", "Ready piece"],
              ["metre", "By the metre"],
            ].map(([v, l]) => (
              <label key={v} className="chip has-[:checked]:border-maroon has-[:checked]:bg-maroon has-[:checked]:text-ivory">
                <input type="radio" name="unit" value={v} defaultChecked={(sp.get("unit") ?? "") === v} className="sr-only" />
                {l}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {(["fabric", "colour", "occasion"] as const).map((k) =>
        facets[k].length ? (
          <fieldset key={k}>
            <legend className="field-label">{k === "colour" ? "Colour" : k[0].toUpperCase() + k.slice(1)}</legend>
            <div className="mt-1 max-h-60 space-y-0.5 overflow-y-auto pr-1">
              {facets[k].map((f) => (
                <label key={f.value} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-cream">
                  <span className="flex items-center gap-3">
                    <input type="checkbox" name={k} value={f.value} defaultChecked={selected(k).has(f.value)} className="h-4 w-4 accent-maroon" />
                    {f.value}
                  </span>
                  <span className="text-xs text-stone">{f.count}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null,
      )}

      <fieldset>
        <legend className="field-label">Availability</legend>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-cream">
          <input type="checkbox" name="stock" value="1" defaultChecked={sp.get("stock") === "1"} className="h-4 w-4 accent-maroon" />
          In stock only <span className="text-xs text-stone">(excludes demo listings)</span>
        </label>
      </fieldset>

      <noscript>
        <button type="submit" className="btn btn-primary w-full">
          Apply filters
        </button>
      </noscript>
    </form>
  );

  if (mode === "sidebar")
    return (
      <aside aria-label="Filters" className={pending ? "opacity-70 transition-opacity" : "transition-opacity"}>
        {body}
      </aside>
    );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-outline !min-h-11" aria-expanded={open} aria-controls="filters-drawer">
        <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters
      </button>
      <div id="filters-drawer" className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open} inert={!open}>
        <div className={`absolute inset-0 bg-maroon-ink/50 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-ivory p-6 pb-28 shadow-2xl transition-transform duration-500 ease-[var(--ease-silk)] ${open ? "translate-y-0" : "translate-y-full"}`}
        >
          <div className="mb-6 flex items-center justify-between">
            <p className="font-display text-3xl">Filters</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-cream">
              <X className="h-6 w-6" />
            </button>
          </div>
          {open && body}
          <div className="fixed inset-x-0 bottom-0 border-t border-sand bg-ivory p-4">
            <button type="button" onClick={() => setOpen(false)} className="btn btn-primary w-full">
              {pending ? "Updating…" : "Show results"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
