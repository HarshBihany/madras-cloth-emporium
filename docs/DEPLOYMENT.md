# Publishing for free (Netlify + Supabase)

Total cost: **₹0**, no credit card. You'll get a free address like `https://madras-cloth-emporium.netlify.app`.

> Free-tier limits change. The figures below were checked in November 2026 — confirm on
> [netlify.com/pricing](https://www.netlify.com/pricing/) and [supabase.com/pricing](https://supabase.com/pricing) before relying on them.

## 1. Put the code on GitHub (free)
1. Create a free GitHub account and a **private** repository, e.g. `madras-cloth-emporium`.
2. Push this project:
   ```bash
   git remote add origin https://github.com/<you>/madras-cloth-emporium.git
   git push -u origin main
   ```
   `.env.local` and the local database are git-ignored — secrets never leave your computer.

## 2. Create the database (Supabase Free)
1. Sign up at supabase.com → **New project**. Choose a strong database password and save it.
   *Region*: pick the **same region as your Netlify functions** (see step 3.5) — the server talks to the database several times per page, so this matters more than distance to customers.
2. Project → **Connect** → copy the **Transaction pooler** connection string (port **6543**).
   Replace `[YOUR-PASSWORD]`. This is your `DATABASE_URL`. (The pooler works over IPv4 and suits serverless; the app already disables prepared statements for it.)
3. Create the tables from your computer:
   ```bash
   DATABASE_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres" npm run db:migrate
   DATABASE_URL="…same…" npm run db:seed        # optional: categories + labelled demo products
   ```
   (Windows PowerShell: `$env:DATABASE_URL="…"; npm run db:migrate`.)
   Alternative: paste each file in `drizzle/*.sql` (in order) into Supabase → SQL Editor, then add categories via `npm run db:seed`.
4. **Photo storage** (optional but recommended): Supabase → Storage → **New bucket** `product-images`, set **Public**. Then Project Settings → API → copy the **Project URL** (`SUPABASE_URL`) and the **service_role** key — or, on newer projects, a **secret** key (`sb_secret_…`) — into `SUPABASE_SERVICE_ROLE_KEY` (server-only, never share it).

## 3. Deploy the site (Netlify Free)
1. Sign up at netlify.com with GitHub → **Add new project → Import from Git** → pick the repo. Netlify detects Next.js automatically (`netlify.toml` is included).
2. Before the first deploy, open **Site configuration → Environment variables** and add:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-site>.netlify.app` |
   | `DATABASE_URL` | Supabase transaction-pooler URI |
   | `ADMIN_EMAIL` | the owner's login email |
   | `ADMIN_PASSWORD_HASH` | from `npm run admin:hash -- "a long password"` |
   | `SESSION_SECRET` | from the same command |
   | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | for photo uploads (optional) |
   | `RESEND_API_KEY`, `NOTIFY_EMAIL` | email alerts (optional, see below) |

3. **Deploy**. Visit `/admin` and sign in.
4. (Optional) Rename the site: Site configuration → *Change site name*.
5. Functions region: check **Site configuration → Build & deploy → Functions region** (if your plan lets you change it, choose the region closest to your Supabase project; otherwise create Supabase in the region shown there).

### Optional: email alerts (Resend free tier)
Create a Resend account **using the shop's email address**, create an API key, and set `RESEND_API_KEY`. Without a verified domain Resend only delivers to the account owner's own address — which is exactly what owner alerts need. Orders and enquiries are always saved in the admin dashboard regardless.

## 4. Keep the free database awake
Supabase Free pauses a project after about a week with no activity. Normal customer traffic keeps it awake. For quiet periods, this repo includes `.github/workflows/keepalive.yml`, which calls `/api/health` twice a week:
GitHub repo → Settings → Secrets and variables → Actions → **Variables** → add `SITE_URL` = your site URL. (If it ever pauses, restore it from the Supabase dashboard — data is kept.)

## Free-tier limits & what they mean for you

| Service | Free allowance (Nov 2026 — verify) | What happens at the limit | Fits this shop? |
|---|---|---|---|
| **Netlify Free** | 300 credits/month shared across bandwidth, function compute and deploys (each production deploy costs credits). Commercial use allowed. | Hard cap: the site is paused until the next month (or you upgrade). No surprise charges. | Yes for a local business. Avoid deploying dozens of times a month — batch your code changes. |
| **Supabase Free** | 500 MB database, 1 GB file storage, ~5 GB egress/month, 2 projects. Pauses after ~7 days inactive. No downloadable automatic backups. | Database becomes read-only when over size; paused projects need a manual restore. | 500 products ≈ a few MB. 1 GB holds ~3,000 photos at ~300 KB — **compress photos** (e.g. squoosh.app). |
| **GitHub Free** | Unlimited private repos; 2,000 Actions minutes/month on private repos. | — | Keep-alive + CI use only a few minutes. |
| **Resend Free** (optional) | ~100 emails/day, 3,000/month. | Emails stop until reset; orders still saved. | Plenty for owner alerts. |
| **WhatsApp (wa.me links)** | Free, unlimited. | — | No Business API needed. |
| **Google Maps embed** | Free, no API key for the basic embed. | — | Yes. |

**When to upgrade (only when the business is ready):** Supabase Pro removes pausing and adds daily backups; a custom `.in` domain costs roughly ₹600–900/year from any registrar and connects to Netlify for free (Domain management → Add a domain, then update `NEXT_PUBLIC_SITE_URL`).

## Backups (do this monthly)
- Admin → Products → **Export CSV** (round-trips through the importer).
- Full database dump (needs PostgreSQL client tools):
  ```bash
  pg_dump "postgresql://postgres.xxxx:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres" -Fc -f mce-backup.dump
  ```
  (Use the **session** pooler port 5432 for `pg_dump`.)

## Alternatives (also free, also commercial-friendly)
- **Cloudflare Workers** via the OpenNext adapter — generous requests, but a 3 MiB worker-size limit on the free plan and more setup.
- **Neon Free** instead of Supabase — any Postgres works; just change `DATABASE_URL`. Use Supabase Storage or another image host for photos.

## Troubleshooting
- *“Admin login is not configured”* → missing `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` / `SESSION_SECRET`.
- *Correct password rejected* → paste the hash exactly (it contains `:` separators, no quotes needed). Too many attempts → wait 15 min or run `DATABASE_URL=… npm run db:clear-rate-limits`.
- *Images don't show after upload* → bucket must be **Public**, and `SUPABASE_URL` must be set **before** building (it configures allowed image hosts). Redeploy after adding it.
- *Site slow on first visit after a quiet period* → serverless cold start; normal on free tiers.
