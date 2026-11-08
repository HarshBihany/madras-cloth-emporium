# Madras Cloth Emporium — website

Premium e-commerce website for **Madras Cloth Emporium**, a family clothing business on Bypass Road, Chas, Bokaro (est. 1970).
Sarees · Suits & Dress Materials · Kurtis · Shirting Fabrics · Suiting Fabrics — with WhatsApp-assisted ordering.

Built entirely on open-source software and genuinely free tiers: **₹0 to develop and launch, no credit card**.

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, self-hosted fonts (Cormorant Garamond + Manrope) |
| Database | PostgreSQL via Drizzle ORM — **Supabase Free** in production, embedded **PGlite** locally (no install) |
| Hosting | **Netlify Free** (commercial use allowed — Vercel's free Hobby plan is *not* for commercial sites) |
| Ordering | Cart → server re-prices & saves order → pre-filled **WhatsApp** message |

## Quick start (local preview)

Requirements: **Node.js 20.9+** (22 recommended) and Git. Nothing else — the database runs inside Node.

```bash
npm install
npm run setup     # creates .env.local, prints your admin password ONCE, creates DB + demo catalogue
npm run dev       # → http://localhost:3000   (admin: http://localhost:3000/admin)
```

Production-mode preview: `npm run build && npm start`.

## What's included

- **Editorial homepage** — heritage story, collections grid, fabric metre guide, services, store map.
- **Catalogue** — 5 categories, search, filters (price, fabric, colour, occasion, unit, stock), sort, pagination; URL-driven so every view is shareable and works without JavaScript.
- **Product pages** — gallery, size/colour variants, **metre quantities** (min + step) or fixed pieces, live line totals, WhatsApp enquiry, related products, SEO structured data.
- **Wishlist & cart** (saved in the browser), **WhatsApp checkout** with server-side re-pricing and stock checks, order reference + **order tracking** page.
- **Forms** — contact, wedding consultation, bulk quotation, custom tailoring (validated on the server, spam-protected, saved to the database, optional email alert).
- **Admin dashboard** — secure login, overview, products (inline price/stock edits, full editor, variants, photo upload), **CSV import/export**, orders (status workflow with automatic stock deduction/restoration, payment & courier fields), enquiries.
- **Ready for later** — Razorpay, courier tracking, GST invoicing, loyalty points, customer accounts (interfaces + database columns in `src/lib/integrations/`).

### Demonstration products
64 clearly-labelled **demo** products are seeded so the site looks complete. They show a “Demo” badge, never claim to be in stock, are excluded from search engines and the sitemap, and use illustrative SVG artwork (no stock photos). Remove them anytime: Admin → Overview → *Hide all demo*, or `npm run db:remove-demo`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run setup` | First-run: `.env.local`, migrations, demo data |
| `npm run db:migrate` | Apply SQL migrations (uses `DATABASE_URL` if set) |
| `npm run db:seed` | Add categories + demo products (idempotent) |
| `npm run db:remove-demo` | Delete all demo products |
| `npm run db:clear-rate-limits` | Unlock admin login after too many attempts |
| `npm run admin:hash -- "password"` | Generate `ADMIN_PASSWORD_HASH` + `SESSION_SECRET` |
| `npm run typecheck` / `npm run lint` | Quality checks |

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how it fits together, security model, data model, integration points
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — publish free on Netlify + Supabase, **free-tier limits**, backups, custom domain
- [docs/ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md) — day-to-day use for the family/staff
- [docs/CSV-IMPORT.md](docs/CSV-IMPORT.md) — moving the manual stock register online

## Editing business details
All contact details live in **`src/lib/config.ts`** (WhatsApp number, email, address, store hours, PIN code). Store hours and PIN code are intentionally left blank until confirmed — the site says “call to confirm timings” instead of guessing.
