/**
 * DEMONSTRATION CATALOGUE — illustrative listings only.
 * Every product here is seeded with isDemo=true, stock 0 and trackStock=false,
 * so the storefront never claims availability for it. Replace via the admin
 * dashboard or CSV import once real inventory data is ready.
 */

export const CATEGORY_SEED = [
  {
    slug: "sarees",
    name: "Sarees",
    tagline: "Six yards of celebration",
    description:
      "Silk, cotton, georgette and chiffon sarees for weddings, festivals and everyday grace — chosen with the eye of a family that has dressed Bokaro since 1970.",
    defaultSaleUnit: "piece" as const,
    sortOrder: 1,
  },
  {
    slug: "suits-dress-materials",
    name: "Suits & Dress Materials",
    tagline: "Unstitched sets, made yours",
    description:
      "Three-piece dress materials and suit sets in cotton, chanderi, georgette and silk blends — ready for your tailor, or ours.",
    defaultSaleUnit: "piece" as const,
    sortOrder: 2,
  },
  {
    slug: "kurtis",
    name: "Kurtis",
    tagline: "Easy elegance, every day",
    description: "Printed, embroidered and solid kurtis in breathable fabrics, sized from S to XXL.",
    defaultSaleUnit: "piece" as const,
    sortOrder: 3,
  },
  {
    slug: "shirting-fabrics",
    name: "Shirting Fabrics",
    tagline: "Crisp cloth, cut by the metre",
    description:
      "Cotton, linen and blended shirting in solids, stripes and checks — sold by the metre for your tailor.",
    defaultSaleUnit: "metre" as const,
    sortOrder: 4,
  },
  {
    slug: "suiting-fabrics",
    name: "Suiting Fabrics",
    tagline: "Tailoring begins with cloth",
    description:
      "Terry-rayon, poly-viscose and wool-blend suiting for suits, trousers and safari sets — sold by the metre.",
    defaultSaleUnit: "metre" as const,
    sortOrder: 5,
  },
];

type DemoSeed = {
  name: string;
  fabric: string;
  colour: string;
  occasion: string;
  work?: string;
  price: number; // rupees
  mrp?: number;
  pattern: string;
  colors: [string, string, string];
  tags?: string[];
  featured?: boolean;
};

const C = {
  maroon: "#6e1a2b",
  wine: "#5a1430",
  ruby: "#9b1b30",
  rani: "#b0306a",
  marigold: "#d98a1c",
  mustard: "#c9a227",
  peacock: "#0f5c63",
  teal: "#1f6f6b",
  emerald: "#1d5b3a",
  bottle: "#21402f",
  navy: "#1d2a44",
  indigo: "#2b3a67",
  ink: "#1c1f2a",
  charcoal: "#33302d",
  grey: "#6b6a68",
  beige: "#d8c7a6",
  cream: "#efe4cf",
  ivory: "#f7f1e5",
  white: "#f8f7f3",
  sky: "#a9c4dc",
  powder: "#c9d8e6",
  mint: "#bcd8c4",
  peach: "#f0c2a2",
  blush: "#e9b8b5",
  lilac: "#b9a6cc",
  mauve: "#8e6178",
  olive: "#6b6a3a",
  brown: "#5a3e2b",
  gold: "#c9a45a",
  goldDeep: "#a8803a",
  silver: "#c8c8c8",
};

const SAREES: DemoSeed[] = [
  { name: "Kanchi-Style Silk Saree, Temple Border", fabric: "Art Silk", colour: "Maroon", occasion: "Wedding", work: "Zari woven", price: 4890, mrp: 5600, pattern: "buti", colors: [C.maroon, C.gold, C.gold], featured: true, tags: ["bridal", "festive"] },
  { name: "Banarasi-Style Brocade Saree", fabric: "Silk Blend", colour: "Rani Pink", occasion: "Wedding", work: "Zari brocade", price: 6490, mrp: 7400, pattern: "jaal", colors: [C.rani, C.gold, C.gold], featured: true, tags: ["bridal"] },
  { name: "Peacock Paisley Silk Saree", fabric: "Art Silk", colour: "Peacock Blue", occasion: "Festive", work: "Zari woven", price: 3990, pattern: "paisley", colors: [C.peacock, C.gold, C.gold], featured: true },
  { name: "Handloom-Look Cotton Saree", fabric: "Cotton", colour: "Ivory", occasion: "Daily Wear", work: "Woven border", price: 1290, pattern: "stripe", colors: [C.ivory, C.maroon, C.ruby] },
  { name: "Bandhani Georgette Saree", fabric: "Georgette", colour: "Marigold", occasion: "Festive", work: "Tie-dye print", price: 1890, mrp: 2200, pattern: "bandhani", colors: [C.marigold, C.ruby, C.gold], featured: true },
  { name: "Ikat Weave Cotton Saree", fabric: "Cotton", colour: "Indigo", occasion: "Office Wear", work: "Ikat print", price: 1590, pattern: "ikat", colors: [C.indigo, C.cream, C.mustard] },
  { name: "Chanderi-Style Buti Saree", fabric: "Chanderi Blend", colour: "Mint", occasion: "Party", work: "Zari buti", price: 2490, pattern: "buti", colors: [C.mint, C.goldDeep, C.gold] },
  { name: "Emerald Jaal Wedding Saree", fabric: "Silk Blend", colour: "Emerald", occasion: "Wedding", work: "Zari jaal", price: 5890, mrp: 6800, pattern: "jaal", colors: [C.emerald, C.gold, C.gold] },
  { name: "Printed Chiffon Saree", fabric: "Chiffon", colour: "Blush", occasion: "Party", work: "Floral print", price: 1490, pattern: "floral", colors: [C.blush, C.mauve, C.gold] },
  { name: "Wine Paisley Festive Saree", fabric: "Art Silk", colour: "Wine", occasion: "Festive", work: "Zari woven", price: 3490, pattern: "paisley", colors: [C.wine, C.gold, C.gold] },
  { name: "Chevron Print Crepe Saree", fabric: "Crepe", colour: "Navy", occasion: "Office Wear", work: "Digital print", price: 1190, pattern: "chevron", colors: [C.navy, C.beige, C.silver] },
  { name: "Mustard Bandhej Cotton Saree", fabric: "Cotton", colour: "Mustard", occasion: "Daily Wear", work: "Tie-dye print", price: 990, pattern: "bandhani", colors: [C.mustard, C.maroon, C.ruby] },
  { name: "Lilac Floral Organza Saree", fabric: "Organza", colour: "Lilac", occasion: "Party", work: "Embroidered", price: 2890, pattern: "floral", colors: [C.lilac, C.ivory, C.silver] },
  { name: "Red Bridal Silk Saree", fabric: "Silk Blend", colour: "Red", occasion: "Wedding", work: "Heavy zari", price: 8990, mrp: 10200, pattern: "jaal", colors: [C.ruby, C.gold, C.gold], featured: true, tags: ["bridal"] },
  { name: "Teal Temple Border Saree", fabric: "Cotton Silk", colour: "Teal", occasion: "Festive", work: "Woven border", price: 2190, pattern: "buti", colors: [C.teal, C.gold, C.mustard] },
  { name: "Ivory & Gold Kasavu-Style Saree", fabric: "Cotton", colour: "Ivory", occasion: "Festive", work: "Zari border", price: 1790, pattern: "plain", colors: [C.ivory, C.cream, C.gold] },
];

const SUITS: DemoSeed[] = [
  { name: "Chanderi Buti Dress Material (3-Piece)", fabric: "Chanderi Blend", colour: "Peach", occasion: "Festive", work: "Zari buti", price: 1890, mrp: 2150, pattern: "buti", colors: [C.peach, C.goldDeep, C.gold], featured: true },
  { name: "Cotton Block Print Suit Set", fabric: "Cotton", colour: "Indigo", occasion: "Daily Wear", work: "Block print", price: 1190, pattern: "floral", colors: [C.indigo, C.ivory, C.mustard] },
  { name: "Georgette Embroidered Suit Set", fabric: "Georgette", colour: "Bottle Green", occasion: "Party", work: "Embroidered", price: 2690, pattern: "jaal", colors: [C.bottle, C.gold, C.gold], featured: true },
  { name: "Bandhani Cotton Dress Material", fabric: "Cotton", colour: "Rani Pink", occasion: "Festive", work: "Tie-dye print", price: 1390, pattern: "bandhani", colors: [C.rani, C.mustard, C.gold] },
  { name: "Paisley Print Lawn Suit", fabric: "Lawn Cotton", colour: "Sky Blue", occasion: "Daily Wear", work: "Print", price: 990, pattern: "paisley", colors: [C.sky, C.navy, C.silver] },
  { name: "Silk Blend Festive Suit Set", fabric: "Silk Blend", colour: "Maroon", occasion: "Wedding", work: "Zari woven", price: 3490, mrp: 3990, pattern: "paisley", colors: [C.maroon, C.gold, C.gold] },
  { name: "Ikat Cotton Dress Material", fabric: "Cotton", colour: "Charcoal", occasion: "Office Wear", work: "Ikat print", price: 1290, pattern: "ikat", colors: [C.charcoal, C.cream, C.ruby] },
  { name: "Mint Floral Muslin Suit", fabric: "Muslin", colour: "Mint", occasion: "Party", work: "Digital print", price: 1590, pattern: "floral", colors: [C.mint, C.rani, C.gold] },
  { name: "Mustard Chevron Rayon Suit", fabric: "Rayon", colour: "Mustard", occasion: "Daily Wear", work: "Print", price: 890, pattern: "chevron", colors: [C.mustard, C.maroon, C.ivory] },
  { name: "Lilac Jaal Organza Suit Set", fabric: "Organza", colour: "Lilac", occasion: "Party", work: "Embroidered", price: 2990, pattern: "jaal", colors: [C.lilac, C.ivory, C.silver] },
  { name: "Ivory Chikan-Inspired Suit Set", fabric: "Cotton", colour: "Ivory", occasion: "Festive", work: "Thread embroidery", price: 2290, pattern: "buti", colors: [C.ivory, C.beige, C.goldDeep] },
  { name: "Wine Velvet-Touch Winter Suit", fabric: "Velvet Blend", colour: "Wine", occasion: "Wedding", work: "Zari embroidery", price: 3990, pattern: "jaal", colors: [C.wine, C.gold, C.gold] },
];

const KURTIS: DemoSeed[] = [
  { name: "A-Line Block Print Cotton Kurti", fabric: "Cotton", colour: "Indigo", occasion: "Daily Wear", work: "Block print", price: 690, mrp: 799, pattern: "floral", colors: [C.indigo, C.ivory, C.mustard], featured: true },
  { name: "Straight Rayon Kurti with Yoke", fabric: "Rayon", colour: "Maroon", occasion: "Office Wear", work: "Print", price: 599, pattern: "buti", colors: [C.maroon, C.gold, C.gold] },
  { name: "Bandhani Print Flared Kurti", fabric: "Rayon", colour: "Marigold", occasion: "Festive", work: "Print", price: 790, pattern: "bandhani", colors: [C.marigold, C.ruby, C.gold], featured: true },
  { name: "Embroidered Georgette Kurti", fabric: "Georgette", colour: "Bottle Green", occasion: "Party", work: "Embroidered", price: 1290, pattern: "jaal", colors: [C.bottle, C.gold, C.gold] },
  { name: "Ikat Print Cotton Kurti", fabric: "Cotton", colour: "Charcoal", occasion: "Office Wear", work: "Print", price: 749, pattern: "ikat", colors: [C.charcoal, C.cream, C.ruby] },
  { name: "Pastel Floral Kurti", fabric: "Cotton", colour: "Blush", occasion: "Daily Wear", work: "Print", price: 649, pattern: "floral", colors: [C.blush, C.emerald, C.gold] },
  { name: "Paisley Festive Kurti", fabric: "Cotton Silk", colour: "Peacock Blue", occasion: "Festive", work: "Foil print", price: 990, pattern: "paisley", colors: [C.peacock, C.gold, C.gold] },
  { name: "Striped Linen-Look Kurti", fabric: "Linen Blend", colour: "Beige", occasion: "Office Wear", work: "Woven stripe", price: 849, pattern: "stripe", colors: [C.beige, C.navy, C.brown] },
  { name: "Chevron Print Straight Kurti", fabric: "Rayon", colour: "Teal", occasion: "Daily Wear", work: "Print", price: 549, pattern: "chevron", colors: [C.teal, C.ivory, C.gold] },
  { name: "Mustard Buti Kurti", fabric: "Cotton", colour: "Mustard", occasion: "Daily Wear", work: "Print", price: 599, pattern: "buti", colors: [C.mustard, C.maroon, C.ruby] },
  { name: "Lilac Gingham Kurti", fabric: "Cotton", colour: "Lilac", occasion: "Daily Wear", work: "Yarn-dyed check", price: 699, pattern: "gingham", colors: [C.white, C.lilac, C.mauve] },
  { name: "Ivory Embroidered Kurti", fabric: "Cotton", colour: "Ivory", occasion: "Festive", work: "Thread embroidery", price: 1190, pattern: "jaal", colors: [C.ivory, C.beige, C.goldDeep] },
];

const SHIRTING: DemoSeed[] = [
  { name: "Giza-Style Cotton Shirting, White", fabric: "Cotton", colour: "White", occasion: "Formal", price: 420, pattern: "twill", colors: [C.white, C.silver, C.grey], featured: true },
  { name: "Oxford Cotton Shirting, Sky Blue", fabric: "Cotton", colour: "Sky Blue", occasion: "Formal", price: 360, pattern: "twill", colors: [C.sky, C.white, C.silver] },
  { name: "Pure Linen-Look Shirting, Beige", fabric: "Linen Blend", colour: "Beige", occasion: "Casual", price: 520, pattern: "plain", colors: [C.beige, C.cream, C.brown] },
  { name: "Bengal Stripe Cotton Shirting", fabric: "Cotton", colour: "Blue/White", occasion: "Formal", price: 340, pattern: "stripe", colors: [C.white, C.indigo, C.sky], featured: true },
  { name: "Pinstripe Formal Shirting", fabric: "Cotton Blend", colour: "Powder Blue", occasion: "Formal", price: 310, pattern: "pinstripe", colors: [C.powder, C.navy, C.white] },
  { name: "Madras Check Cotton Shirting", fabric: "Cotton", colour: "Multi", occasion: "Casual", price: 290, pattern: "checks", colors: [C.ruby, C.mustard, C.navy], featured: true },
  { name: "Gingham Check Shirting, Navy", fabric: "Cotton", colour: "Navy/White", occasion: "Casual", price: 280, pattern: "gingham", colors: [C.white, C.navy, C.navy] },
  { name: "Herringbone Cotton Shirting", fabric: "Cotton", colour: "Ivory", occasion: "Formal", price: 390, pattern: "herringbone", colors: [C.ivory, C.beige, C.silver] },
  { name: "Poly-Cotton Uniform Shirting", fabric: "Poly-Cotton", colour: "White", occasion: "Uniform", price: 180, pattern: "plain", colors: [C.white, C.silver, C.grey], tags: ["bulk", "uniform"] },
  { name: "Tattersall Check Shirting", fabric: "Cotton", colour: "Cream", occasion: "Casual", price: 330, pattern: "checks", colors: [C.cream, C.emerald, C.ruby] },
  { name: "Chambray Shirting, Indigo", fabric: "Cotton", colour: "Indigo", occasion: "Casual", price: 350, pattern: "twill", colors: [C.indigo, C.sky, C.white] },
  { name: "Satin Finish Party Shirting, Black", fabric: "Cotton Satin", colour: "Black", occasion: "Party", price: 460, pattern: "twill", colors: [C.ink, C.charcoal, C.silver] },
];

const SUITING: DemoSeed[] = [
  { name: "Terry-Rayon Suiting, Charcoal", fabric: "Terry-Rayon", colour: "Charcoal", occasion: "Formal", price: 520, pattern: "twill", colors: [C.charcoal, C.grey, C.silver], featured: true },
  { name: "Poly-Viscose Suiting, Navy", fabric: "Poly-Viscose", colour: "Navy", occasion: "Formal", price: 460, pattern: "twill", colors: [C.navy, C.indigo, C.silver] },
  { name: "Wool-Blend Herringbone Suiting", fabric: "Wool Blend", colour: "Grey", occasion: "Wedding", price: 1290, pattern: "herringbone", colors: [C.grey, C.charcoal, C.silver], featured: true },
  { name: "Chalk Stripe Suiting, Ink Blue", fabric: "Wool Blend", colour: "Ink Blue", occasion: "Wedding", price: 1450, pattern: "pinstripe", colors: [C.ink, C.silver, C.white] },
  { name: "Trouser Suiting, Khaki", fabric: "Poly-Viscose", colour: "Khaki", occasion: "Daily Wear", price: 380, pattern: "twill", colors: [C.beige, C.brown, C.cream] },
  { name: "Safari Suiting, Olive", fabric: "Terry-Cotton", colour: "Olive", occasion: "Formal", price: 420, pattern: "plain", colors: [C.olive, C.beige, C.cream] },
  { name: "Glen Check Suiting, Brown", fabric: "Wool Blend", colour: "Brown", occasion: "Wedding", price: 1190, pattern: "checks", colors: [C.brown, C.beige, C.mustard] },
  { name: "Jodhpuri / Bandhgala Suiting, Wine", fabric: "Jacquard Blend", colour: "Wine", occasion: "Wedding", price: 980, pattern: "jaal", colors: [C.wine, C.goldDeep, C.gold], featured: true },
  { name: "School Uniform Suiting, Grey", fabric: "Poly-Viscose", colour: "Grey", occasion: "Uniform", price: 350, pattern: "plain", colors: [C.grey, C.silver, C.charcoal], tags: ["bulk", "uniform"] },
  { name: "Black Formal Suiting", fabric: "Terry-Rayon", colour: "Black", occasion: "Formal", price: 560, pattern: "twill", colors: [C.ink, C.charcoal, C.grey] },
  { name: "Pinstripe Trouser Suiting, Grey", fabric: "Poly-Viscose", colour: "Grey", occasion: "Formal", price: 440, pattern: "pinstripe", colors: [C.grey, C.white, C.silver] },
  { name: "Ivory Wedding Suiting", fabric: "Jacquard Blend", colour: "Ivory", occasion: "Wedding", price: 890, pattern: "jaal", colors: [C.ivory, C.beige, C.goldDeep] },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const DEMO_NOTE =
  "Demonstration listing: this product, its price and its description are illustrative examples showing how the catalogue will look. Ask us on WhatsApp for similar pieces currently in the store.";

export function buildDemoProducts() {
  type Out = {
    categorySlug: string;
    slug: string;
    sku: string;
    name: string;
    shortDescription: string;
    description: string;
    fabric: string;
    colour: string;
    occasion: string;
    work: string;
    widthInches: number | null;
    care: string;
    saleUnit: "piece" | "metre";
    pricePaise: number;
    mrpPaise: number | null;
    minQty: number;
    qtyStep: number;
    featured: boolean;
    tags: string[];
    artPattern: string;
    artColors: string[];
    hsnCode: string | null;
    attributes: Record<string, string>;
    variants: { optionType: string; label: string; pricePaise: number | null }[];
  };
  const out: Out[] = [];
  let n = 1;

  const push = (cat: string, list: DemoSeed[], f: (d: DemoSeed) => Partial<Out>) => {
    for (const d of list) {
      const base: Out = {
        categorySlug: cat,
        slug: `demo-${slugify(d.name)}`,
        sku: `DEMO-${String(n++).padStart(3, "0")}`,
        name: d.name,
        shortDescription: `${d.fabric} · ${d.colour}${d.work ? ` · ${d.work}` : ""}`,
        description: DEMO_NOTE,
        fabric: d.fabric,
        colour: d.colour,
        occasion: d.occasion,
        work: d.work ?? "",
        widthInches: null,
        care: "Dry clean recommended for silk and zari. Gentle hand wash in cold water for cotton.",
        saleUnit: "piece",
        pricePaise: d.price * 100,
        mrpPaise: d.mrp ? d.mrp * 100 : null,
        minQty: 1,
        qtyStep: 1,
        featured: !!d.featured,
        tags: ["demo", ...(d.tags ?? [])],
        artPattern: d.pattern,
        artColors: d.colors,
        hsnCode: null,
        attributes: {},
        variants: [],
      };
      out.push({ ...base, ...f(d) });
    }
  };

  push("sarees", SAREES, () => ({
    attributes: { Length: "5.5 m saree + 0.8 m blouse piece (typical)", "Blouse piece": "Included (unstitched)" },
  }));
  push("suits-dress-materials", SUITS, () => ({
    attributes: { Set: "Top 2.5 m · Bottom 2.5 m · Dupatta 2.25 m (typical)", Stitching: "Unstitched — tailoring on request" },
  }));
  push("kurtis", KURTIS, () => ({
    attributes: { Fit: "Regular", Length: "Calf length (approx. 44–46 in)", Sleeves: "Three-quarter" },
    variants: ["S", "M", "L", "XL", "XXL"].map((s) => ({ optionType: "size", label: s, pricePaise: null })),
  }));
  push("shirting-fabrics", SHIRTING, () => ({
    saleUnit: "metre",
    minQty: 1,
    qtyStep: 0.25,
    widthInches: 58,
    care: "Machine wash cold, gentle cycle. Iron on medium heat.",
    attributes: { Weave: "As pictured", "Suggested use": "Shirts, kurtas" },
  }));
  push("suiting-fabrics", SUITING, () => ({
    saleUnit: "metre",
    minQty: 1,
    qtyStep: 0.25,
    widthInches: 58,
    care: "Dry clean recommended.",
    attributes: { "Suggested use": "Suits, trousers, safari sets, bandhgalas" },
  }));

  return out;
}
