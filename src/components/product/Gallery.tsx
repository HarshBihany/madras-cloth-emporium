"use client";

import { useState } from "react";
import { ProductMedia } from "./ProductMedia";

type Media = {
  slug: string;
  name: string;
  images: string[];
  artPattern: string;
  artColors: string[];
  category: { slug: string };
};

export function Gallery({ p }: { p: Media }) {
  const views: { key: string; label: string; index: number; view: "full" | "detail" | "border" }[] = p.images.length
    ? p.images.map((_, i) => ({ key: `img-${i}`, label: `Photo ${i + 1}`, index: i, view: "full" as const }))
    : [
        { key: "full", label: "Full view", index: 0, view: "full" },
        { key: "detail", label: "Weave detail", index: 0, view: "detail" },
        { key: "border", label: p.category.slug === "sarees" ? "Border & pallu" : "Drape", index: 0, view: "border" },
      ];
  const [active, setActive] = useState(0);
  const v = views[active];

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      <div className="flex gap-3 sm:flex-col" role="tablist" aria-label="Product views">
        {views.map((x, i) => (
          <button
            key={x.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={x.label}
            onClick={() => setActive(i)}
            className={`relative aspect-[4/5] w-16 overflow-hidden rounded-xl border-2 transition sm:w-20 ${i === active ? "border-maroon" : "border-transparent opacity-70 hover:opacity-100"}`}
          >
            <ProductMedia p={p} view={x.view} index={x.index} sizes="80px" />
          </button>
        ))}
      </div>
      <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-[1.5rem] bg-cream" role="tabpanel" aria-label={v.label}>
        <div key={v.key} className="absolute inset-0 animate-[fade-up_0.6s_var(--ease-silk)_both]">
          <ProductMedia p={p} view={v.view} index={v.index} sizes="(min-width: 1024px) 55vw, 100vw" priority />
        </div>
        {!p.images.length && (
          <span className="absolute bottom-4 left-4 rounded-full bg-ivory/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-stone backdrop-blur">
            Illustrative artwork — photo coming soon
          </span>
        )}
      </div>
    </div>
  );
}
