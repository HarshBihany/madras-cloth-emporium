"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Approximate fabric requirements for 58–60" wide cloth, adult sizes.
 * Guidance only — always confirm with your tailor (size, style & width vary).
 */
const GARMENTS = [
  { id: "shirt-half", label: "Half-sleeve shirt", m: [1.5, 1.75], href: "/collections/shirting-fabrics" },
  { id: "shirt-full", label: "Full-sleeve shirt", m: [1.6, 2.0], href: "/collections/shirting-fabrics" },
  { id: "kurta", label: "Men's kurta", m: [2.25, 2.75], href: "/collections/shirting-fabrics" },
  { id: "trouser", label: "Trousers", m: [1.2, 1.4], href: "/collections/suiting-fabrics" },
  { id: "suit2", label: "Two-piece suit", m: [2.75, 3.25], href: "/collections/suiting-fabrics" },
  { id: "suit3", label: "Three-piece suit", m: [3.25, 3.75], href: "/collections/suiting-fabrics" },
  { id: "safari", label: "Safari suit", m: [2.75, 3.25], href: "/collections/suiting-fabrics" },
  { id: "bandhgala", label: "Bandhgala / Jodhpuri", m: [3.0, 3.5], href: "/collections/suiting-fabrics" },
] as const;

export function MetreGuide() {
  const [sel, setSel] = useState<(typeof GARMENTS)[number]["id"]>("suit2");
  const [qty, setQty] = useState(1);
  const g = GARMENTS.find((x) => x.id === sel)!;
  const lo = +(g.m[0] * qty).toFixed(2);
  const hi = +(g.m[1] * qty).toFixed(2);

  return (
    <div className="relative rounded-[1.75rem] border border-sand bg-ivory p-6 shadow-[0_40px_80px_-50px_rgba(46,9,17,0.45)] sm:p-9">
      <p className="eyebrow">Fabric counter guide</p>
      <h3 className="mt-3 font-display text-3xl sm:text-4xl">How much cloth do I need?</h3>
      <fieldset className="mt-6">
        <legend className="field-label">I&apos;m stitching</legend>
        <div className="flex flex-wrap gap-2">
          {GARMENTS.map((x) => (
            <button key={x.id} type="button" className="chip" aria-pressed={sel === x.id} onClick={() => setSel(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-6 flex items-center gap-4">
        <span className="field-label !mb-0">Quantity</span>
        <div className="inline-flex items-center rounded-full border border-sand bg-white">
          <button type="button" aria-label="Fewer garments" className="h-10 w-10 text-lg" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </button>
          <output aria-live="polite" className="w-8 text-center font-semibold">
            {qty}
          </output>
          <button type="button" aria-label="More garments" className="h-10 w-10 text-lg" onClick={() => setQty((q) => Math.min(20, q + 1))}>
            +
          </button>
        </div>
      </div>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-maroon px-6 py-5 text-ivory">
        <div>
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-gold-light">You&apos;ll need about</p>
          <p className="font-display text-5xl leading-none" aria-live="polite">
            {lo}–{hi}
            <span className="ml-2 text-2xl text-gold-light">metres</span>
          </p>
        </div>
        <Link href={g.href} className="btn btn-gold !min-h-11">
          Browse fabric
        </Link>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-stone">
        Approximate guide for 58–60″ wide fabric and average adult sizes. Patterned fabrics, larger sizes and special styles may need
        more — please confirm with your tailor or ask us on WhatsApp.
      </p>
    </div>
  );
}
