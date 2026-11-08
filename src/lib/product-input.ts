import { z } from "zod";
import { clean } from "@/lib/validation";
import { ART_PATTERNS } from "@/components/fabric/FabricArt";

/** Shared validation for admin product form AND CSV import rows. */

export const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

const str = (max: number) =>
  z
    .string()
    .optional()
    .transform((v) => clean(v ?? ""))
    .pipe(z.string().max(max, `Maximum ${max} characters`));

const rupees = z.coerce
  .number({ error: "Enter a price in rupees" })
  .min(0, "Price can't be negative")
  .max(10_00_000, "Price looks too high")
  .transform((r) => Math.round(r * 100));

const optRupees = z
  .union([z.literal(""), z.coerce.number().min(0).max(10_00_000)])
  .optional()
  .transform((v) => (v === "" || v == null ? null : Math.round(Number(v) * 100)));

const qty = (min: number, max: number) => z.coerce.number().min(min).max(max).transform((n) => Math.round(n * 100) / 100);

export const variantInput = z.object({
  id: z.uuid().optional().or(z.literal("")),
  optionType: z.enum(["size", "colour", "length", "option"]).default("size"),
  label: z.string().transform(clean).pipe(z.string().min(1, "Variant label required").max(40)),
  sku: str(60),
  price: optRupees,
  stockQty: qty(0, 100000).default(0),
});

const urlList = z
  .array(
    z
      .string()
      .trim()
      .refine((u) => /^\/uploads\/[\w/.-]+$/.test(u) || /^https:\/\/[^\s"'<>]+$/.test(u), "Images must be https:// URLs or uploaded files"),
  )
  .max(12, "Up to 12 images");

export const productInput = z
  .object({
    name: z.string().transform(clean).pipe(z.string().min(3, "Name is too short").max(140)),
    slug: str(90),
    sku: str(60),
    categoryId: z.coerce.number().int().positive("Choose a category"),
    shortDescription: str(200),
    description: str(5000),
    fabric: str(60),
    colour: str(60),
    occasion: str(60),
    work: str(80),
    widthInches: z
      .union([z.literal(""), z.coerce.number().int().min(10).max(120)])
      .optional()
      .transform((v) => (v === "" || v == null ? null : Number(v))),
    care: str(500),
    saleUnit: z.enum(["piece", "metre"]),
    price: rupees,
    mrp: optRupees,
    minQty: qty(0.25, 100).default(1),
    qtyStep: qty(0.05, 10).default(1),
    stockQty: qty(0, 1_000_000).default(0),
    trackStock: z.boolean().default(true),
    lowStockThreshold: qty(0, 10000).default(3),
    isDemo: z.boolean().default(false),
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    featured: z.boolean().default(false),
    tags: z
      .array(z.string().transform(clean).pipe(z.string().min(1).max(30)))
      .max(20)
      .default([]),
    images: urlList.default([]),
    attributes: z.record(z.string().max(40), z.string().max(200)).default({}),
    artPattern: z.enum(ART_PATTERNS as [string, ...string[]]).default("buti"),
    artColors: z
      .array(z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colours must be hex like #6e1a2b"))
      .max(3)
      .default([]),
    hsnCode: str(10).transform((v) => v || null),
    gstRatePct: z
      .union([z.literal(""), z.coerce.number().min(0).max(28)])
      .optional()
      .transform((v) => (v === "" || v == null ? null : Number(v))),
    variants: z.array(variantInput).max(40).default([]),
  })
  .superRefine((v, ctx) => {
    if (v.mrp != null && v.mrp < v.price) ctx.addIssue({ code: "custom", path: ["mrp"], message: "MRP should be at least the selling price" });
    if (v.slug && !slugRe.test(v.slug)) ctx.addIssue({ code: "custom", path: ["slug"], message: "Use lowercase letters, numbers and hyphens" });
    if (v.saleUnit === "piece" && !Number.isInteger(v.minQty)) ctx.addIssue({ code: "custom", path: ["minQty"], message: "Pieces must be whole numbers" });
    const labels = new Set<string>();
    v.variants.forEach((x, i) => {
      const k = x.label.toLowerCase();
      if (labels.has(k)) ctx.addIssue({ code: "custom", path: ["variants", i, "label"], message: `Duplicate variant "${x.label}"` });
      labels.add(k);
    });
  });

export type ProductInput = z.output<typeof productInput>;
