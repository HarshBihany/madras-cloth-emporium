import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/* All money is stored as integer paise (₹1 = 100 paise) to avoid float errors. */

export const saleUnitEnum = pgEnum("sale_unit", ["piece", "metre"]);
export const productStatusEnum = pgEnum("product_status", ["draft", "active", "archived"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending", // created from cart, awaiting WhatsApp confirmation
  "confirmed", // staff confirmed availability & price (stock deducted here)
  "packed",
  "shipped",
  "delivered",
  "completed", // in-store pickup completed
  "cancelled",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "partially_paid", "paid", "refunded"]);
export const enquiryTypeEnum = pgEnum("enquiry_type", ["contact", "wedding", "bulk", "tailoring", "product"]);
export const enquiryStatusEnum = pgEnum("enquiry_status", ["new", "in_progress", "closed"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  defaultSaleUnit: saleUnitEnum("default_sale_unit").notNull().default("piece"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    sku: text("sku"),
    name: text("name").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    shortDescription: text("short_description").notNull().default(""),
    description: text("description").notNull().default(""),
    fabric: text("fabric").notNull().default(""),
    colour: text("colour").notNull().default(""),
    occasion: text("occasion").notNull().default(""),
    work: text("work").notNull().default(""), // e.g. zari, embroidery, block print
    widthInches: integer("width_inches"), // fabric width (for metre goods)
    care: text("care").notNull().default(""),
    saleUnit: saleUnitEnum("sale_unit").notNull().default("piece"),
    pricePaise: integer("price_paise").notNull(),
    mrpPaise: integer("mrp_paise"),
    minQty: numeric("min_qty", { precision: 8, scale: 2, mode: "number" }).notNull().default(1),
    qtyStep: numeric("qty_step", { precision: 8, scale: 2, mode: "number" }).notNull().default(1),
    stockQty: numeric("stock_qty", { precision: 10, scale: 2, mode: "number" }).notNull().default(0),
    trackStock: boolean("track_stock").notNull().default(true),
    lowStockThreshold: numeric("low_stock_threshold", { precision: 8, scale: 2, mode: "number" }).notNull().default(3),
    isDemo: boolean("is_demo").notNull().default(false),
    status: productStatusEnum("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    tags: text("tags").array().notNull().default([]),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    attributes: jsonb("attributes").$type<Record<string, string>>().notNull().default({}),
    // Placeholder artwork used when no photos exist yet
    artPattern: text("art_pattern").notNull().default("buti"),
    artColors: text("art_colors").array().notNull().default([]),
    // GST readiness (confirm rates with your CA before invoicing)
    hsnCode: text("hsn_code"),
    gstRatePct: numeric("gst_rate_pct", { precision: 5, scale: 2, mode: "number" }),
    ...timestamps,
  },
  (t) => [
    index("products_category_idx").on(t.categoryId),
    index("products_status_idx").on(t.status),
    index("products_price_idx").on(t.pricePaise),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku"),
    optionType: text("option_type").notNull().default("size"), // size | colour | length
    label: text("label").notNull(),
    pricePaise: integer("price_paise"), // null = use product price
    stockQty: numeric("stock_qty", { precision: 10, scale: 2, mode: "number" }).notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("variants_product_idx").on(t.productId)],
);

/** Future customer accounts (Supabase Auth user id goes in authUserId). */
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  authUserId: text("auth_user_id").unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  loyaltyBalance: integer("loyalty_balance").notNull().default(0),
  ...timestamps,
});

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull().unique(),
    status: orderStatusEnum("status").notNull().default("pending"),
    channel: text("channel").notNull().default("whatsapp"),
    fulfilment: text("fulfilment").notNull().default("delivery"), // delivery | pickup
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    addressLine: text("address_line"),
    city: text("city"),
    state: text("state"),
    pincode: text("pincode"),
    customerNotes: text("customer_notes"),
    adminNotes: text("admin_notes"),
    subtotalPaise: integer("subtotal_paise").notNull(),
    shippingPaise: integer("shipping_paise").notNull().default(0),
    discountPaise: integer("discount_paise").notNull().default(0),
    totalPaise: integer("total_paise").notNull(),
    containsDemoItems: boolean("contains_demo_items").notNull().default(false),
    stockDeducted: boolean("stock_deducted").notNull().default(false),
    // Payment integration points (Razorpay etc.)
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
    paymentProvider: text("payment_provider"),
    paymentRef: text("payment_ref"),
    // Shipping integration points
    courier: text("courier"),
    trackingNumber: text("tracking_number"),
    // GST invoicing integration point
    invoiceNumber: text("invoice_number"),
    // Loyalty integration point
    loyaltyPointsEarned: integer("loyalty_points_earned").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("orders_status_idx").on(t.status), index("orders_phone_idx").on(t.phone)],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
    productName: text("product_name").notNull(),
    productSlug: text("product_slug").notNull(),
    variantLabel: text("variant_label"),
    saleUnit: saleUnitEnum("sale_unit").notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 2, mode: "number" }).notNull(),
    unitPricePaise: integer("unit_price_paise").notNull(),
    lineTotalPaise: integer("line_total_paise").notNull(),
    isDemo: boolean("is_demo").notNull().default(false),
    hsnCode: text("hsn_code"),
    gstRatePct: numeric("gst_rate_pct", { precision: 5, scale: 2, mode: "number" }),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

/** Status history — powers order tracking & audit trail. */
export const orderEvents = pgTable(
  "order_events",
  {
    id: serial("id").primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatusEnum("status").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("order_events_order_idx").on(t.orderId)],
);

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: enquiryTypeEnum("type").notNull(),
    status: enquiryStatusEnum("status").notNull().default("new"),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    city: text("city"),
    message: text("message"),
    details: jsonb("details").$type<Record<string, string>>().notNull().default({}),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    adminNotes: text("admin_notes"),
    ...timestamps,
  },
  (t) => [index("enquiries_type_idx").on(t.type), index("enquiries_status_idx").on(t.status)],
);

/** Future automated loyalty points (append-only ledger). */
export const loyaltyLedger = pgTable("loyalty_ledger", {
  id: serial("id").primaryKey(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  points: integer("points").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Fixed-window rate limiting that works across serverless instances. */
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").primaryKey(),
    windowStart: timestamp("window_start", { withTimezone: true }).defaultNow().notNull(),
    count: integer("count").notNull().default(0),
  },
);

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderEvent = typeof orderEvents.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type EnquiryType = (typeof enquiryTypeEnum.enumValues)[number];
export type EnquiryStatus = (typeof enquiryStatusEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
