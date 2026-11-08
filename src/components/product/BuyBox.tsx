"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { availability } from "@/lib/availability";
import { formatPaise, formatQty, isValidQty, lineTotal } from "@/lib/money";
import { whatsappUrl, siteUrl } from "@/lib/config";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";

type Variant = { id: string; label: string; optionType: string; pricePaise: number | null; stockQty: number };
type P = {
  id: string;
  slug: string;
  name: string;
  saleUnit: "piece" | "metre";
  pricePaise: number;
  minQty: number;
  qtyStep: number;
  stockQty: number;
  trackStock: boolean;
  lowStockThreshold: number;
  isDemo: boolean;
  images: string[];
  artPattern: string;
  artColors: string[];
  shape: string;
  variants: Variant[];
};

export function BuyBox({ p }: { p: P }) {
  const add = useCart((s) => s.add);
  const [variantId, setVariantId] = useState<string | null>(p.variants.length === 1 ? p.variants[0].id : null);
  const [qty, setQty] = useState(p.minQty);
  const [added, setAdded] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const variant = p.variants.find((v) => v.id === variantId) ?? null;
  const unitPrice = variant?.pricePaise ?? p.pricePaise;
  const avail = availability(p, p.variants.length ? variant : null);
  const outOfStock = !p.isDemo && avail.state === "out" && (!p.variants.length || variant);
  const optionType = p.variants[0]?.optionType ?? "size";
  const isMetre = p.saleUnit === "metre";

  const quick = useMemo(() => (isMetre ? [1, 1.25, 1.6, 2, 2.5, 3, 3.5].filter((x) => x >= p.minQty && isValidQty(x, p.minQty, p.qtyStep)) : []), [isMetre, p.minQty, p.qtyStep]);

  const step = (dir: 1 | -1) => setQty((q) => Math.max(p.minQty, Math.min(200, Math.round((q + dir * p.qtyStep) * 100) / 100)));

  const onAdd = () => {
    setErr(null);
    if (p.variants.length && !variant) return setErr(`Please choose a ${optionType}.`);
    if (!isValidQty(qty, p.minQty, p.qtyStep)) return setErr(`Quantity must be at least ${p.minQty} in steps of ${p.qtyStep}.`);
    add({
      productId: p.id,
      variantId: variant?.id ?? null,
      slug: p.slug,
      name: p.name,
      variantLabel: variant?.label ?? null,
      saleUnit: p.saleUnit,
      unitPricePaise: unitPrice,
      qty,
      minQty: p.minQty,
      qtyStep: p.qtyStep,
      isDemo: p.isDemo,
      art: { pattern: p.artPattern, colors: p.artColors, shape: p.shape },
      image: p.images[0] ?? null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3500);
  };

  const enquiry = `Hello! I'm interested in "${p.name}"${variant ? ` (${variant.label})` : ""}${isMetre ? ` — ${qty} m` : ""}.\n${siteUrl}/product/${p.slug}\nIs it available?`;

  return (
    <div className="space-y-6">
      {p.variants.length > 0 && (
        <fieldset>
          <legend className="field-label">
            {optionType === "size" ? "Size" : optionType === "colour" ? "Colour" : "Option"}
            {variant && <span className="ml-2 normal-case tracking-normal text-charcoal">— {variant.label}</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {p.variants.map((v) => {
              const vOut = !p.isDemo && p.trackStock && v.stockQty <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={variantId === v.id}
                  onClick={() => setVariantId(v.id)}
                  className={`chip min-w-[3.25rem] justify-center ${vOut ? "line-through opacity-50" : ""}`}
                  aria-label={`${v.label}${vOut ? " (out of stock)" : ""}`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
          {optionType === "size" && (
            <p className="mt-2 text-xs text-stone">
              Unsure of your size?{" "}
              <a href={whatsappUrl(`Hello! Could you help me with sizing for "${p.name}"?`)} target="_blank" rel="noopener noreferrer" className="link-underline text-maroon">
                Ask us for measurements
              </a>
            </p>
          )}
        </fieldset>
      )}

      <div>
        <label htmlFor="qty" className="field-label">
          {isMetre ? "Length (metres)" : "Quantity"}
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-sand bg-white">
            <button type="button" className="inline-flex h-12 w-12 items-center justify-center" aria-label="Decrease" onClick={() => step(-1)}>
              <Minus className="h-4 w-4" />
            </button>
            <input
              id="qty"
              type="number"
              inputMode="decimal"
              min={p.minQty}
              max={200}
              step={p.qtyStep}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="h-12 w-16 bg-transparent text-center font-semibold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button type="button" className="inline-flex h-12 w-12 items-center justify-center" aria-label="Increase" onClick={() => step(1)}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {isMetre && <span className="text-sm text-stone">Min {p.minQty} m · steps of {p.qtyStep} m</span>}
        </div>
        {quick.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Common lengths">
            {quick.map((q) => (
              <button key={q} type="button" className="chip !min-h-9 !px-3 !py-1 text-xs" aria-pressed={qty === q} onClick={() => setQty(q)}>
                {q} m
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between rounded-2xl bg-cream px-5 py-4">
        <span className="text-sm text-charcoal-soft">
          {formatQty(p.saleUnit, isValidQty(qty, p.minQty, p.qtyStep) ? qty : p.minQty)} × {formatPaise(unitPrice)}
        </span>
        <span className="font-display text-3xl text-maroon">{formatPaise(lineTotal(unitPrice, isValidQty(qty, p.minQty, p.qtyStep) ? qty : p.minQty))}</span>
      </div>

      {err && (
        <p role="alert" className="text-sm font-medium text-danger">
          {err}
        </p>
      )}

      <p className={`text-sm font-medium ${avail.state === "out" ? "text-danger" : avail.state === "demo" ? "text-gold-deep" : avail.state === "low" ? "text-gold-deep" : "text-success"}`}>
        {avail.label}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onAdd} disabled={!!outOfStock} className="btn btn-primary flex-1">
          {added ? <Check className="h-4 w-4" aria-hidden /> : <ShoppingBag className="h-4 w-4" aria-hidden />}
          {outOfStock ? "Out of stock" : added ? "Added to bag" : "Add to bag"}
        </button>
        <a href={whatsappUrl(enquiry)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp flex-1">
          <WhatsAppIcon className="h-5 w-5" /> Ask on WhatsApp
        </a>
      </div>
      <p aria-live="polite" className="text-sm">
        {added && (
          <>
            Added. <Link href="/cart" className="link-underline font-semibold text-maroon">View bag & send order →</Link>
          </>
        )}
      </p>
    </div>
  );
}
