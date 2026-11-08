"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import { saveProduct, uploadImage, type SaveProductState } from "@/app/actions/admin";
import { ART_PATTERNS, FabricArt, shapeForCategory } from "@/components/fabric/FabricArt";
import { slugify } from "@/lib/product-input";

type Cat = { id: number; slug: string; name: string; defaultSaleUnit: "piece" | "metre" };
type Variant = { id?: string; optionType: string; label: string; sku: string; price: string; stockQty: string };
export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  fabric: string;
  colour: string;
  occasion: string;
  work: string;
  widthInches: string;
  care: string;
  saleUnit: "piece" | "metre";
  price: string;
  mrp: string;
  minQty: string;
  qtyStep: string;
  stockQty: string;
  trackStock: boolean;
  lowStockThreshold: string;
  isDemo: boolean;
  status: "draft" | "active" | "archived";
  featured: boolean;
  tags: string;
  images: string[];
  attributes: { k: string; v: string }[];
  artPattern: string;
  artColors: string[];
  hsnCode: string;
  gstRatePct: string;
  variants: Variant[];
};

export const EMPTY_PRODUCT: ProductFormValues = {
  name: "",
  slug: "",
  sku: "",
  categoryId: "",
  shortDescription: "",
  description: "",
  fabric: "",
  colour: "",
  occasion: "",
  work: "",
  widthInches: "",
  care: "",
  saleUnit: "piece",
  price: "",
  mrp: "",
  minQty: "1",
  qtyStep: "1",
  stockQty: "0",
  trackStock: true,
  lowStockThreshold: "3",
  isDemo: false,
  status: "draft",
  featured: false,
  tags: "",
  images: [],
  attributes: [],
  artPattern: "buti",
  artColors: ["#6e1a2b", "#d9c08a", "#c9a45a"],
  hsnCode: "",
  gstRatePct: "",
  variants: [],
};

function Section({ title, children, desc }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-sand bg-white p-5 sm:p-6">
      <h2 className="text-2xl">{title}</h2>
      {desc && <p className="mt-1 text-sm text-stone">{desc}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function ProductForm({ initial, categories, saved }: { initial: ProductFormValues; categories: Cat[]; saved?: boolean }) {
  const [v, setV] = useState<ProductFormValues>(initial);
  const [state, action, pending] = useActionState<SaveProductState, FormData>(saveProduct, saved ? { ok: true, message: "Saved." } : {});
  const [uploading, startUpload] = useTransition();
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const errs = state.fieldErrors ?? {};
  const set = <K extends keyof ProductFormValues>(k: K, val: ProductFormValues[K]) => setV((s) => ({ ...s, [k]: val }));
  const cat = categories.find((c) => String(c.id) === v.categoryId);

  const payload = JSON.stringify({
    ...v,
    tags: v.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    attributes: Object.fromEntries(v.attributes.filter((a) => a.k.trim() && a.v.trim()).map((a) => [a.k.trim(), a.v.trim()])),
    variants: v.variants.map((x) => ({ ...x, price: x.price, id: x.id ?? "" })),
  });

  const field = (k: keyof ProductFormValues, label: string, opts: { type?: string; full?: boolean; placeholder?: string; step?: string; help?: string } = {}) => (
    <div className={opts.full ? "sm:col-span-2" : ""}>
      <label htmlFor={`pf-${k}`} className="field-label">
        {label}
      </label>
      <input
        id={`pf-${k}`}
        type={opts.type ?? "text"}
        step={opts.step}
        value={v[k] as string}
        placeholder={opts.placeholder}
        onChange={(e) => set(k, e.target.value as never)}
        aria-invalid={!!errs[k]}
        className="field"
      />
      {opts.help && !errs[k] && <p className="mt-1 text-xs text-stone">{opts.help}</p>}
      {errs[k] && <p className="mt-1 text-xs font-medium text-danger">{errs[k]}</p>}
    </div>
  );

  const onUpload = (file: File) => {
    setUploadErr(null);
    const fd = new FormData();
    fd.set("file", file);
    startUpload(async () => {
      const r = await uploadImage(fd);
      if (r.url) set("images", [...v.images, r.url]);
      else setUploadErr(r.error ?? "Upload failed");
      if (fileRef.current) fileRef.current.value = "";
    });
  };

  const moveImage = (i: number, d: -1 | 1) => {
    const arr = [...v.images];
    const j = i + d;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set("images", arr);
  };

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <input type="hidden" name="id" value={v.id ?? ""} />
      <input type="hidden" name="payload" value={payload} />

      <div className="space-y-6">
        <Section title="Basics">
          <div className="sm:col-span-2">
            <label htmlFor="pf-name" className="field-label">
              Product name
            </label>
            <input
              id="pf-name"
              value={v.name}
              onChange={(e) => setV((s) => ({ ...s, name: e.target.value, slug: s.id || s.slug !== slugify(s.name) ? s.slug : slugify(e.target.value) }))}
              aria-invalid={!!errs.name}
              className="field"
              required
            />
            {errs.name && <p className="mt-1 text-xs font-medium text-danger">{errs.name}</p>}
          </div>
          {field("slug", "URL slug", { help: "Used in the product link: /product/your-slug" })}
          {field("sku", "SKU / item code (optional)")}
          <div>
            <label htmlFor="pf-cat" className="field-label">
              Category
            </label>
            <select
              id="pf-cat"
              value={v.categoryId}
              onChange={(e) => {
                const c = categories.find((x) => String(x.id) === e.target.value);
                setV((s) => ({
                  ...s,
                  categoryId: e.target.value,
                  ...(c && !s.id ? { saleUnit: c.defaultSaleUnit, qtyStep: c.defaultSaleUnit === "metre" ? "0.25" : "1" } : {}),
                }));
              }}
              aria-invalid={!!errs.categoryId}
              className="field"
            >
              <option value="">Choose…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errs.categoryId && <p className="mt-1 text-xs font-medium text-danger">{errs.categoryId}</p>}
          </div>
          <div>
            <label htmlFor="pf-status" className="field-label">
              Status
            </label>
            <select id="pf-status" value={v.status} onChange={(e) => set("status", e.target.value as ProductFormValues["status"])} className="field">
              <option value="draft">Draft (hidden)</option>
              <option value="active">Active (visible on site)</option>
              <option value="archived">Archived (hidden)</option>
            </select>
          </div>
          {field("shortDescription", "Short description", { full: true, placeholder: "e.g. Silk blend · Maroon · Zari border" })}
          <div className="sm:col-span-2">
            <label htmlFor="pf-desc" className="field-label">
              Full description
            </label>
            <textarea id="pf-desc" value={v.description} onChange={(e) => set("description", e.target.value)} className="field" rows={5} />
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={v.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-maroon" /> Feature on the homepage
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={v.isDemo} onChange={(e) => set("isDemo", e.target.checked)} className="h-4 w-4 accent-maroon" /> Demonstration listing (not real stock)
          </label>
        </Section>

        <Section title="Price & stock" desc={v.saleUnit === "metre" ? "Price is per metre. Customers choose a length in steps." : "Price is per piece."}>
          <div>
            <span className="field-label">Sold</span>
            <div className="flex gap-2">
              {(["piece", "metre"] as const).map((u) => (
                <button key={u} type="button" className="chip" aria-pressed={v.saleUnit === u} onClick={() => setV((s) => ({ ...s, saleUnit: u, qtyStep: u === "metre" ? "0.25" : "1", minQty: "1" }))}>
                  {u === "piece" ? "Per piece" : "By the metre"}
                </button>
              ))}
            </div>
          </div>
          <div />
          {field("price", v.saleUnit === "metre" ? "Price per metre (₹)" : "Selling price (₹)", { type: "number", step: "0.01" })}
          {field("mrp", "MRP / original price (₹, optional)", { type: "number", step: "0.01", help: "Shows a strike-through and % off" })}
          {field("minQty", v.saleUnit === "metre" ? "Minimum metres" : "Minimum quantity", { type: "number", step: "0.25" })}
          {field("qtyStep", v.saleUnit === "metre" ? "Cut step (metres)" : "Quantity step", { type: "number", step: "0.05" })}
          {field("stockQty", v.variants.length ? "Stock (sum of variants)" : v.saleUnit === "metre" ? "Stock (metres)" : "Stock (pieces)", { type: "number", step: "0.25" })}
          {field("lowStockThreshold", "Low-stock alert at", { type: "number", step: "0.25" })}
          <label className="flex items-center gap-3 text-sm sm:col-span-2">
            <input type="checkbox" checked={v.trackStock} onChange={(e) => set("trackStock", e.target.checked)} className="h-4 w-4 accent-maroon" />
            Track stock (block orders above available quantity). Untick for made-to-order items.
          </label>
        </Section>

        <section className="rounded-2xl border border-sand bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl">Variants</h2>
              <p className="mt-1 text-sm text-stone">Sizes (S–XXL) or colourways with their own stock. Leave price empty to use the main price.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-outline !min-h-9 !px-3 !py-1 !text-[0.65rem]" onClick={() => set("variants", ["S", "M", "L", "XL", "XXL"].map((s) => ({ optionType: "size", label: s, sku: "", price: "", stockQty: "0" })))}>
                Add sizes S–XXL
              </button>
              <button type="button" className="btn btn-outline !min-h-9 !px-3 !py-1 !text-[0.65rem]" onClick={() => set("variants", [...v.variants, { optionType: "size", label: "", sku: "", price: "", stockQty: "0" }])}>
                <Plus className="h-3.5 w-3.5" aria-hidden /> Variant
              </button>
            </div>
          </div>
          {v.variants.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-stone">
                  <tr>
                    <th className="py-2 pr-2">Type</th>
                    <th className="py-2 pr-2">Label</th>
                    <th className="py-2 pr-2">Price ₹ (optional)</th>
                    <th className="py-2 pr-2">Stock</th>
                    <th className="py-2 pr-2">SKU</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {v.variants.map((x, i) => {
                    const upd = (patch: Partial<Variant>) => set("variants", v.variants.map((y, j) => (j === i ? { ...y, ...patch } : y)));
                    return (
                      <tr key={x.id ?? `n${i}`}>
                        <td className="py-1 pr-2">
                          <select value={x.optionType} onChange={(e) => upd({ optionType: e.target.value })} className="field !min-h-9 !px-2 !py-1" aria-label="Variant type">
                            <option value="size">Size</option>
                            <option value="colour">Colour</option>
                            <option value="length">Length</option>
                            <option value="option">Option</option>
                          </select>
                        </td>
                        <td className="py-1 pr-2">
                          <input value={x.label} onChange={(e) => upd({ label: e.target.value })} className="field !min-h-9 !px-2 !py-1" aria-label="Variant label" aria-invalid={!!errs[`variants.${i}.label`]} />
                        </td>
                        <td className="py-1 pr-2">
                          <input type="number" step="0.01" value={x.price} onChange={(e) => upd({ price: e.target.value })} className="field !min-h-9 !px-2 !py-1" aria-label="Variant price" />
                        </td>
                        <td className="py-1 pr-2">
                          <input type="number" step="0.25" value={x.stockQty} onChange={(e) => upd({ stockQty: e.target.value })} className="field !min-h-9 !px-2 !py-1" aria-label="Variant stock" />
                        </td>
                        <td className="py-1 pr-2">
                          <input value={x.sku} onChange={(e) => upd({ sku: e.target.value })} className="field !min-h-9 !px-2 !py-1" aria-label="Variant SKU" />
                        </td>
                        <td className="py-1">
                          <button type="button" aria-label={`Remove variant ${x.label}`} onClick={() => set("variants", v.variants.filter((_, j) => j !== i))} className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream hover:text-danger">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {Object.entries(errs)
                .filter(([k]) => k.startsWith("variants"))
                .map(([k, m]) => (
                  <p key={k} className="mt-1 text-xs font-medium text-danger">
                    {m}
                  </p>
                ))}
            </div>
          )}
        </section>

        <Section title="Fabric & details">
          {field("fabric", "Fabric", { placeholder: "e.g. Silk Blend, Cotton, Terry-Rayon" })}
          {field("colour", "Colour")}
          {field("occasion", "Occasion", { placeholder: "Wedding, Festive, Daily Wear, Formal…" })}
          {field("work", "Work / finish", { placeholder: "Zari woven, Embroidered, Print…" })}
          {field("widthInches", "Fabric width (inches)", { type: "number" })}
          {field("tags", "Tags (comma separated)", { placeholder: "bridal, festive" })}
          <div className="sm:col-span-2">
            <label htmlFor="pf-care" className="field-label">
              Care
            </label>
            <textarea id="pf-care" value={v.care} onChange={(e) => set("care", e.target.value)} className="field !min-h-20" rows={2} />
          </div>
          <div className="sm:col-span-2">
            <span className="field-label">Extra specifications</span>
            <div className="space-y-2">
              {v.attributes.map((a, i) => (
                <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                  <input value={a.k} placeholder="e.g. Length" aria-label="Specification name" onChange={(e) => set("attributes", v.attributes.map((y, j) => (j === i ? { ...y, k: e.target.value } : y)))} className="field !min-h-9 !py-1" />
                  <input value={a.v} placeholder="e.g. 5.5 m + blouse piece" aria-label="Specification value" onChange={(e) => set("attributes", v.attributes.map((y, j) => (j === i ? { ...y, v: e.target.value } : y)))} className="field !min-h-9 !py-1" />
                  <button type="button" aria-label="Remove specification" onClick={() => set("attributes", v.attributes.filter((_, j) => j !== i))} className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => set("attributes", [...v.attributes, { k: "", v: "" }])} className="text-sm font-semibold text-maroon">
                + Add specification
              </button>
            </div>
          </div>
        </Section>

        <Section title="Tax (for future GST invoicing)" desc="Optional now. Confirm HSN codes and GST rates with your accountant before invoicing.">
          {field("hsnCode", "HSN code")}
          {field("gstRatePct", "GST rate (%)", { type: "number", step: "0.01" })}
        </Section>
      </div>

      <div className="space-y-6">
        <div className="xl:sticky xl:top-6 xl:space-y-6">
          <section className="rounded-2xl border border-sand bg-white p-5">
            <h2 className="text-2xl">Photos</h2>
            <p className="mt-1 text-xs text-stone">JPEG/PNG/WebP up to 3 MB. First photo is the main image.</p>
            <ul className="mt-4 grid grid-cols-3 gap-2">
              {v.images.map((src, i) => (
                <li key={src} className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-cream">
                  <Image src={src} alt="" fill sizes="100px" className="object-cover" unoptimized={src.startsWith("/uploads/")} />
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-charcoal/70 p-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                    <button type="button" aria-label="Move earlier" onClick={() => moveImage(i, -1)} className="text-ivory">
                      <ArrowUp className="h-3.5 w-3.5 -rotate-90" />
                    </button>
                    <button type="button" aria-label="Remove photo" onClick={() => set("images", v.images.filter((_, j) => j !== i))} className="text-ivory">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" aria-label="Move later" onClick={() => moveImage(i, 1)} className="text-ivory">
                      <ArrowDown className="h-3.5 w-3.5 -rotate-90" />
                    </button>
                  </div>
                </li>
              ))}
              <li>
                <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-sand-deep text-xs text-stone hover:bg-cream">
                  <ImagePlus className="h-5 w-5" aria-hidden />
                  {uploading ? "Uploading…" : "Upload"}
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
                </label>
              </li>
            </ul>
            {uploadErr && <p className="mt-2 text-xs font-medium text-danger">{uploadErr}</p>}
            {errs.images && <p className="mt-2 text-xs font-medium text-danger">{errs.images}</p>}
            <div className="mt-3 flex gap-2">
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="…or paste https:// image URL" aria-label="Image URL" className="field !min-h-9 !py-1 text-xs" />
              <button
                type="button"
                className="btn btn-outline !min-h-9 !px-3 !py-1 !text-[0.6rem]"
                onClick={() => {
                  if (/^https:\/\/\S+$/.test(imageUrl)) {
                    set("images", [...v.images, imageUrl]);
                    setImageUrl("");
                  }
                }}
              >
                Add
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-sand bg-white p-5">
            <h2 className="text-2xl">Placeholder artwork</h2>
            <p className="mt-1 text-xs text-stone">Shown only while the product has no photos.</p>
            <div className="mt-4 aspect-[4/5] overflow-hidden rounded-xl">
              <FabricArt seed={v.slug || "preview"} pattern={v.artPattern} colors={v.artColors} shape={shapeForCategory(cat?.slug)} className="h-full w-full" />
            </div>
            <label htmlFor="pf-art" className="field-label mt-4">
              Pattern
            </label>
            <select id="pf-art" value={v.artPattern} onChange={(e) => set("artPattern", e.target.value)} className="field !min-h-9 !py-1">
              {ART_PATTERNS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <div className="mt-3 flex gap-3">
              {[0, 1, 2].map((i) => (
                <label key={i} className="flex flex-col items-center gap-1 text-[0.65rem] text-stone">
                  <input
                    type="color"
                    value={v.artColors[i] ?? "#c9a45a"}
                    onChange={(e) => {
                      const c = [...v.artColors];
                      c[i] = e.target.value;
                      set("artColors", c.map((x) => x ?? "#c9a45a"));
                    }}
                    className="h-9 w-12 cursor-pointer rounded border border-sand"
                  />
                  {["Base", "Motif", "Border"][i]}
                </label>
              ))}
            </div>
          </section>

          <div className="rounded-2xl border border-sand bg-white p-5">
            {state.message && (
              <p role={state.ok ? "status" : "alert"} className={`mb-3 rounded-xl px-3 py-2 text-sm font-medium ${state.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                {state.message}
              </p>
            )}
            <button type="submit" disabled={pending || uploading} className="btn btn-primary w-full">
              {pending ? "Saving…" : v.id ? "Save changes" : "Create product"}
            </button>
            {v.id && (
              <a href={`/product/${v.slug}`} target="_blank" rel="noopener noreferrer" className="mt-3 block text-center text-sm text-maroon underline">
                View on site ↗ {v.status !== "active" && "(only visible when Active)"}
              </a>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
