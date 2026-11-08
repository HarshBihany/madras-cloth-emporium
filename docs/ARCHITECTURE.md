# Architecture

```
 Customer's phone / browser
   │  HTML rendered on the server (SEO), small client components for cart, filters, forms
   ▼
 Netlify (Free) ── Next.js 16 App Router (Node.js serverless functions + CDN for static assets)
   ├─ src/proxy.ts ............ guards /admin and /api/admin (signed session cookie)
   ├─ src/app/(site)/ ......... public pages (home, shop, collections, product, cart, forms…)
   ├─ src/app/admin/ .......... dashboard (every page & action re-checks the session)
   ├─ src/app/actions/ ........ server actions: checkout, enquiries, tracking, auth, admin
   ├─ src/lib/data/ ........... read queries (Drizzle ORM)
   └─ src/lib/integrations/ ... payments · shipping · GST invoicing · loyalty · email
   ▼
 PostgreSQL ── Supabase Free (production)  |  PGlite embedded (local dev, ./.data/pglite)
 Object storage ── Supabase Storage (product photos)   |  public/uploads (local dev)
 WhatsApp ── wa.me deep links (free, no Business API)   Google Maps ── keyless embed
```

## Key decisions

| Decision | Why |
|---|---|
| **Netlify Free** for hosting | Allows commercial use with a hard spending cap (no surprise bills, no card). Vercel Hobby forbids commercial use. |
| **Drizzle + plain Postgres** (not the Supabase JS client) | One code path for local PGlite and production Postgres; portable to Neon/any Postgres; testable offline. |
| **Server-rendered on every request** (`cacheComponents` off) | Prices and stock must never be stale; simple and predictable on serverless. Static pages (wedding, contact…) are still prerendered. |
| **Database opened lazily** | Next.js imports route modules in helper worker processes; they must not open DB connections (and PGlite is single-process). |
| **Money in integer paise; quantities as numeric(10,2)** | No floating-point errors; fabric metres like 2.25 m are exact. |
| **Cart in the browser, re-priced on the server** | No account needed; the server never trusts client prices or quantities. |
| **WhatsApp checkout** | Matches how customers already buy; zero fees; staff confirm stock/price/delivery personally. |
| **SVG “FabricArt” placeholders** | Elegant, deterministic, clearly illustrative — no stock photos that could mislead customers. |

## Data model (simplified)

```
categories ─< products ─< product_variants
                 │
orders ─< order_items (snapshot of name/price/qty, keeps history if a product is deleted)
   └─< order_events (status history → powers /track)
enquiries (contact | wedding | bulk | tailoring; form-specific details in JSONB)
customers ─< loyalty_ledger      (future: accounts + loyalty)
rate_limits                      (cross-instance throttling)
```

Prepared columns for later: `orders.payment_status/payment_provider/payment_ref`, `courier/tracking_number`, `invoice_number`, `loyalty_points_earned`, `customer_id`; `products.hsn_code/gst_rate_pct`.

## Order lifecycle

```
Received (pending) ──► Confirmed ──► Packed ──► Shipped ──► Delivered
        │                 │  (stock deducted here)    └► (Completed for store pickup)
        └──► Cancelled ◄──┘  (stock restored if it was deducted)
```
Transitions are enforced server-side (`src/lib/order-status.ts`). Demo items never touch stock.

## Security model

- **Admin auth**: single owner account from env vars; password hashed with **scrypt** (Node stdlib); session is an HS256 JWT in an **HttpOnly, Secure, SameSite=Strict** cookie (8 h). Checked in `proxy.ts` *and* in every admin page/action (`requireAdmin()`).
- **Brute-force protection**: 5 login attempts / 15 min per IP + global cap, stored in Postgres (works across serverless instances). IPs are stored only as salted SHA-256 hashes.
- **Validation**: every form & action is validated with **Zod on the server**; control characters stripped; lengths capped; phone/PIN formats enforced; honeypot fields for bots.
- **CSRF**: Next.js server actions verify the request Origin; cookies are SameSite=Strict.
- **Uploads**: images verified by magic bytes (not file extension), 3 MB cap, random file names.
- **CSV export**: formula-injection safe (`=`, `+`, `-`, `@` cells are neutralised).
- **Headers**: CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy; admin pages `noindex` + `no-store`.
- **Supabase**: Row Level Security is enabled on every table (migration `0001`), so the auto-generated public API exposes nothing. The app connects with the database role via `DATABASE_URL` (server-only). The anon key is never used.
- **Privacy**: minimal personal data; privacy notice at `/policies#privacy`; demo listings flagged; no third-party trackers.

## Integration points (not active in v1)

| Area | Where | How to enable later |
|---|---|---|
| Online payments (Razorpay) | `src/lib/integrations/payments` | Implement `RazorpayProvider`, add webhook route, set `PAYMENTS_ENABLED=true` + keys |
| Courier / tracking | `src/lib/integrations/shipping` | Implement `ShippingProvider` (e.g. Shiprocket) and call from order page |
| GST invoices | `src/lib/integrations/invoicing/gst.ts` | Tax split helpers ready; add invoice numbering + PDF; confirm HSN/rates with a CA |
| Loyalty points | `src/lib/integrations/loyalty` | Rules config + ledger table ready; award on delivery once accounts exist |
| Customer accounts | `customers` table | Use Supabase Auth (free tier) — store `auth_user_id`, link orders by `customer_id` |
| Email alerts | `src/lib/integrations/email.ts` | Set `RESEND_API_KEY` (free tier) — already wired to orders & enquiries |
