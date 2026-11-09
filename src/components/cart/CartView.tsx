"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { CheckCircle2, Minus, Plus, Trash2, Store, Truck } from "lucide-react";
import { useCart, useHydrated, type CartLine } from "@/lib/store/cart";
import { formatPaise, formatQty, lineTotal } from "@/lib/money";
import { placeOrder } from "@/app/actions/checkout";
import { FabricArt, type ArtShape } from "@/components/fabric/FabricArt";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";
import { DemoBadge } from "@/components/product/ProductCard";
import { WhatsAppAutoOpen } from "@/components/forms/WhatsAppAutoOpen";
import type { FieldErrors } from "@/lib/validation";

function LineThumb({ l }: { l: CartLine }) {
  return (
    <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xl bg-cream sm:w-24">
      {l.image ? (
        <Image src={l.image} alt="" fill sizes="96px" className="object-cover" />
      ) : (
        <FabricArt seed={l.slug} pattern={l.art.pattern} colors={l.art.colors} shape={l.art.shape as ArtShape} className="h-full w-full" />
      )}
    </div>
  );
}

function Field({
  name,
  label,
  errors,
  className = "",
  ...rest
}: { name: string; label: string; errors: FieldErrors } & React.InputHTMLAttributes<HTMLInputElement>) {
  const err = errors[name];
  return (
    <div className={className}>
      <label htmlFor={`co-${name}`} className="field-label">
        {label}
      </label>
      <input id={`co-${name}`} name={name} className="field" aria-invalid={!!err} aria-describedby={err ? `co-${name}-err` : undefined} {...rest} />
      {err && (
        <p id={`co-${name}-err`} className="mt-1.5 text-xs font-medium text-danger">
          {err}
        </p>
      )}
    </div>
  );
}

export function CartView() {
  const hydrated = useHydrated();
  const { lines, setQty, remove, clear } = useCart();
  const [fulfilment, setFulfilment] = useState<"pickup" | "delivery">("delivery");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState<{ orderNumber: string; url: string; total: number } | null>(null);
  const [pending, start] = useTransition();

  if (!hydrated) return <div className="mt-12 h-64 animate-pulse rounded-3xl bg-cream" aria-hidden />;

  if (done)
    return (
      <div className="mx-auto mt-12 max-w-2xl rounded-[2rem] border border-sand bg-white/60 p-8 text-center sm:p-12" role="status">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" aria-hidden />
        <h2 className="mt-5 text-4xl">Order request saved</h2>
        <p className="mt-3 text-charcoal-soft">
          Your reference is <strong className="font-mono text-lg text-maroon">{done.orderNumber}</strong>. Send it to us on WhatsApp — our team will confirm
          availability, final price and delivery.
        </p>
        <WhatsAppAutoOpen url={done.url} label="Send order on WhatsApp" />
        <p className="mt-6 text-sm text-stone">
          Keep your reference to{" "}
          <Link href="/track" className="link-underline text-maroon">
            track this order
          </Link>
          .
        </p>
      </div>
    );

  if (!lines.length)
    return (
      <div className="mt-12 rounded-[2rem] border border-dashed border-sand-deep p-12 text-center">
        <p className="font-display text-3xl">Your bag is empty.</p>
        <p className="mt-2 text-charcoal-soft">Start with a saree, a suit, or a few metres of fine cloth.</p>
        <Link href="/shop" className="btn btn-primary mt-6">
          Explore the collection
        </Link>
      </div>
    );

  const subtotal = lines.reduce((s, l) => s + lineTotal(l.unitPricePaise, l.qty), 0);
  const hasDemo = lines.some((l) => l.isDemo);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const g = (k: string) => (fd.get(k) as string | null) ?? "";
    setFormError(null);
    start(async () => {
      const res = await placeOrder({
        name: g("name"),
        phone: g("phone"),
        email: g("email"),
        fulfilment,
        addressLine: g("addressLine"),
        city: g("city"),
        state: g("state"),
        pincode: g("pincode"),
        notes: g("notes"),
        consent: fd.get("consent") === "on",
        website: g("website"),
        lines: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty })),
      });
      if (res.ok) {
        setDone({ orderNumber: res.orderNumber, url: res.whatsappUrl, total: res.totalPaise });
        clear();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrors(res.fieldErrors ?? {});
        setLineErrors(res.lineErrors ?? {});
        setFormError(res.error);
      }
    });
  };

  return (
    <div className="mt-12 grid gap-12 lg:grid-cols-12">
      <section className="lg:col-span-7" aria-labelledby="bag-items">
        <h2 id="bag-items" className="sr-only">
          Items
        </h2>
        <ul className="divide-y divide-sand border-y border-sand">
          {lines.map((l) => (
            <li key={l.key} className="flex gap-4 py-6 sm:gap-6">
              <LineThumb l={l} />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/product/${l.slug}`} className="font-display text-xl leading-snug hover:text-maroon">
                      {l.name}
                    </Link>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone">
                      {l.variantLabel && <span>Size/option: {l.variantLabel}</span>}
                      <span>
                        {formatPaise(l.unitPricePaise)}
                        {l.saleUnit === "metre" ? " / metre" : " each"}
                      </span>
                      {l.isDemo && <DemoBadge />}
                    </p>
                  </div>
                  <button type="button" onClick={() => remove(l.key)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-stone hover:bg-cream hover:text-danger" aria-label={`Remove ${l.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                  <div className="inline-flex items-center rounded-full border border-sand bg-white">
                    <button type="button" className="inline-flex h-10 w-10 items-center justify-center" aria-label={`Decrease ${l.name}`} onClick={() => setQty(l.key, l.qty - l.qtyStep)}>
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-16 text-center text-sm font-semibold" aria-live="polite">
                      {formatQty(l.saleUnit, l.qty)}
                    </span>
                    <button type="button" className="inline-flex h-10 w-10 items-center justify-center" aria-label={`Increase ${l.name}`} onClick={() => setQty(l.key, l.qty + l.qtyStep)}>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-semibold text-maroon">{formatPaise(lineTotal(l.unitPricePaise, l.qty))}</span>
                </div>
                {lineErrors[l.key] && (
                  <p role="alert" className="mt-2 text-sm font-medium text-danger">
                    {lineErrors[l.key]}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-baseline justify-between">
          <span className="text-charcoal-soft">Estimated subtotal</span>
          <span className="font-display text-4xl text-maroon">{formatPaise(subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-stone">Prices are re-checked by our system when you send the order. Delivery charges, if any, are confirmed on WhatsApp.</p>
        {hasDemo && (
          <p className="mt-4 rounded-2xl border border-gold/50 bg-gold-pale/40 p-4 text-sm text-charcoal-soft">
            Your bag includes <strong>demo listings</strong>. You can still send the request — we&apos;ll reply with similar pieces available in the store.
          </p>
        )}
      </section>

      <section className="lg:col-span-5" aria-labelledby="checkout-title">
        <form
          onSubmit={onSubmit}
          onChange={(e) => {
            const n = (e.target as unknown as HTMLInputElement).name;
            if (n && errors[n])
              setErrors((prev) => {
                const next = { ...prev };
                delete next[n];
                return next;
              });
          }}
          noValidate
          className="space-y-5 rounded-[1.75rem] border border-sand bg-white/60 p-6 sm:p-8 lg:sticky lg:top-28">
          <h2 id="checkout-title" className="text-3xl">
            Your details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="name" label="Full name" autoComplete="name" required errors={errors} className="sm:col-span-2" />
            <Field name="phone" label="WhatsApp number" type="tel" inputMode="tel" autoComplete="tel" placeholder="98XXXXXXXX" required errors={errors} />
            <Field name="email" label="Email (optional)" type="email" autoComplete="email" errors={errors} />
          </div>

          <fieldset>
            <legend className="field-label">How would you like to receive it?</legend>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["delivery", "Deliver to me", Truck],
                  ["pickup", "Pick up in Chas", Store],
                ] as const
              ).map(([v, l, Icon]) => (
                <button key={v} type="button" aria-pressed={fulfilment === v} onClick={() => setFulfilment(v)} className="chip !min-h-12 justify-center !rounded-xl">
                  <Icon className="h-4 w-4" aria-hidden /> {l}
                </button>
              ))}
            </div>
          </fieldset>

          {fulfilment === "delivery" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="addressLine" label="Address" autoComplete="street-address" errors={errors} className="sm:col-span-2" />
              <Field name="city" label="City / town" autoComplete="address-level2" errors={errors} />
              <Field name="pincode" label="PIN code" inputMode="numeric" autoComplete="postal-code" maxLength={7} errors={errors} />
              <Field name="state" label="State" autoComplete="address-level1" defaultValue="Jharkhand" errors={errors} className="sm:col-span-2" />
            </div>
          )}

          <div>
            <label htmlFor="co-notes" className="field-label">
              Notes (optional)
            </label>
            <textarea id="co-notes" name="notes" maxLength={600} className="field !min-h-24" placeholder="Occasion, preferred colours, blouse stitching…" />
          </div>

          {/* honeypot — hidden from people, tempting for bots */}
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="co-website">Website</label>
            <input id="co-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <label className="flex items-start gap-3 text-sm text-charcoal-soft">
            <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-maroon" required aria-invalid={!!errors.consent} />
            <span>
              I agree to be contacted on WhatsApp or phone about this order, and to the{" "}
              <Link href="/policies#privacy" className="link-underline text-maroon">
                privacy notice
              </Link>
              .
            </span>
          </label>
          {errors.consent && <p className="-mt-3 text-xs font-medium text-danger">{errors.consent}</p>}

          {formError && (
            <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
              {formError}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn btn-whatsapp w-full">
            <WhatsAppIcon className="h-5 w-5" />
            {pending ? "Saving your order…" : `Send order on WhatsApp · ${formatPaise(subtotal)}`}
          </button>
          <p className="text-center text-xs text-stone">No online payment. We confirm everything with you first.</p>
        </form>
      </section>
    </div>
  );
}
