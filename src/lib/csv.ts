import Papa from "papaparse";
import { productInput, slugify, type ProductInput } from "@/lib/product-input";

/**
 * CSV import format (one product per row). Header names are case-insensitive.
 * Required: name, category, price.  See docs/CSV-IMPORT.md for full details.
 */
export const CSV_COLUMNS = [
  "slug",
  "name",
  "category",
  "sale_unit",
  "price",
  "mrp",
  "stock",
  "min_qty",
  "qty_step",
  "track_stock",
  "low_stock_threshold",
  "fabric",
  "colour",
  "occasion",
  "work",
  "width_inches",
  "short_description",
  "description",
  "care",
  "tags",
  "images",
  "variants",
  "status",
  "featured",
  "is_demo",
  "sku",
  "hsn_code",
  "gst_rate",
  "art_pattern",
  "art_colors",
] as const;

export const CSV_TEMPLATE_ROWS = [
  {
    slug: "maroon-silk-saree-temple-border",
    name: "Maroon Silk Saree with Temple Border",
    category: "sarees",
    sale_unit: "piece",
    price: "4890",
    mrp: "5600",
    stock: "3",
    fabric: "Silk Blend",
    colour: "Maroon",
    occasion: "Wedding",
    work: "Zari woven",
    tags: "bridal|festive",
    status: "draft",
    featured: "yes",
    is_demo: "no",
  },
  {
    name: "Cotton Shirting White",
    category: "shirting-fabrics",
    sale_unit: "metre",
    price: "420",
    stock: "85.5",
    min_qty: "1",
    qty_step: "0.25",
    width_inches: "58",
    fabric: "Cotton",
    colour: "White",
    status: "draft",
  },
  {
    name: "Printed Rayon Kurti",
    category: "kurtis",
    sale_unit: "piece",
    price: "690",
    variants: "S:2|M:5|L:4|XL:0|XXL:1",
    fabric: "Rayon",
    colour: "Indigo",
    status: "draft",
  },
];

const yes = (v: string | undefined, dflt: boolean) => {
  if (v == null || v.trim() === "") return dflt;
  return ["yes", "y", "true", "1"].includes(v.trim().toLowerCase());
};
const list = (v: string | undefined) =>
  (v ?? "")
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean);

export type ParsedRow = { line: number; data: ProductInput & { slug: string }; replaceVariants: boolean };
export type RowError = { line: number; name: string; errors: string[] };

export function parseProductCsv(text: string, categories: { id: number; slug: string; name: string; defaultSaleUnit: "piece" | "metre" }[]) {
  const res = Papa.parse<Record<string, string>>(text.replace(/^﻿/, ""), {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });
  const rows: ParsedRow[] = [];
  const errors: RowError[] = [];
  if (res.errors.length) {
    for (const e of res.errors.slice(0, 20)) errors.push({ line: (e.row ?? 0) + 2, name: "", errors: [e.message] });
  }
  const missing = ["name", "category", "price"].filter((c) => !res.meta.fields?.includes(c));
  if (missing.length) return { rows, errors: [{ line: 1, name: "header", errors: [`Missing required column(s): ${missing.join(", ")}`] }], total: 0 };
  if (res.data.length > 2000) return { rows, errors: [{ line: 1, name: "file", errors: ["Maximum 2,000 rows per import — split the file."] }], total: res.data.length };

  const catBy = new Map<string, (typeof categories)[number]>();
  for (const c of categories) {
    catBy.set(c.slug, c);
    catBy.set(c.name.toLowerCase(), c);
  }
  const seen = new Set<string>();

  res.data.forEach((r, i) => {
    const line = i + 2;
    const g = (k: string) => (r[k] ?? "").trim();
    const cat = catBy.get(g("category").toLowerCase());
    const rowErrors: string[] = [];
    if (!cat) rowErrors.push(`Unknown category "${g("category")}". Use one of: ${categories.map((c) => c.slug).join(", ")}`);

    const variants = list(g("variants")).map((v) => {
      const [label, stock, price] = v.split(":").map((x) => x.trim());
      return { label, stockQty: stock || "0", price: price ?? "", optionType: "size", sku: "" };
    });
    const attrs: Record<string, string> = {};
    for (const [k, v] of Object.entries(r)) if (k.startsWith("attr_") && v?.trim()) attrs[k.slice(5).replace(/_/g, " ")] = v.trim();

    const candidate = {
      name: g("name"),
      slug: g("slug") || slugify(g("name")),
      sku: g("sku"),
      categoryId: cat?.id ?? 0,
      shortDescription: g("short_description"),
      description: g("description"),
      fabric: g("fabric"),
      colour: g("colour") || g("color"),
      occasion: g("occasion"),
      work: g("work"),
      widthInches: g("width_inches"),
      care: g("care"),
      saleUnit: (g("sale_unit").toLowerCase() || cat?.defaultSaleUnit || "piece") as "piece" | "metre",
      price: g("price").replace(/[₹,\s]/g, ""),
      mrp: g("mrp").replace(/[₹,\s]/g, ""),
      minQty: g("min_qty") || "1",
      qtyStep: g("qty_step") || (g("sale_unit").toLowerCase() === "metre" || cat?.defaultSaleUnit === "metre" ? "0.25" : "1"),
      stockQty: g("stock") || "0",
      trackStock: yes(g("track_stock"), true),
      lowStockThreshold: g("low_stock_threshold") || "3",
      isDemo: yes(g("is_demo"), false),
      status: (g("status").toLowerCase() || "draft") as "draft",
      featured: yes(g("featured"), false),
      tags: list(g("tags")),
      images: list(g("images")),
      attributes: attrs,
      artPattern: g("art_pattern") || "buti",
      artColors: list(g("art_colors")),
      hsnCode: g("hsn_code"),
      gstRatePct: g("gst_rate"),
      variants,
    };
    const parsed = productInput.safeParse(candidate);
    if (!parsed.success) for (const iss of parsed.error.issues) rowErrors.push(`${iss.path.join(".") || "row"}: ${iss.message}`);
    if (seen.has(candidate.slug)) rowErrors.push(`Duplicate slug "${candidate.slug}" in this file`);
    seen.add(candidate.slug);
    if (rowErrors.length || !parsed.success) errors.push({ line, name: g("name"), errors: rowErrors });
    else rows.push({ line, data: { ...parsed.data, slug: candidate.slug }, replaceVariants: g("variants") !== "" });
  });
  return { rows, errors, total: res.data.length };
}

/** Neutralise spreadsheet formula injection (cells starting with = + - @ tab CR). */
function safeCell(v: unknown) {
  const s = v == null ? "" : String(v);
  return /^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s) ? `'${s}` : s;
}

export function toCsv(rows: Record<string, unknown>[], columns: readonly string[]) {
  return Papa.unparse({ fields: [...columns], data: rows.map((r) => columns.map((c) => safeCell(r[c]))) }, { quotes: true });
}
