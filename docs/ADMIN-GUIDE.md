# Admin guide (for the family & staff)

Sign in at **/admin** with the owner email and password.

## Daily routine
1. **Overview** shows orders awaiting confirmation and new enquiries (highlighted in maroon).
2. A customer's WhatsApp message contains an order reference like `MCE-261108-AB2CD`. Open **Orders**, find it, and:
   - check availability and the final price with the customer on WhatsApp;
   - add shipping or discount if needed (total updates automatically);
   - set status to **Confirmed** → stock is deducted automatically for real, tracked products;
   - record payment (UPI/cash, reference/UTR) and later the courier + tracking number;
   - add a short *note for history* — customers see it on the **Track order** page.
3. **Cancelled** after confirming? Stock is put back automatically.
4. **Enquiries**: reply with the WhatsApp button, then mark *In progress* / *Closed* and add internal notes.

## Products
- **Inline edits**: change price, stock or status in the table and press **Save** on that row.
- **Full editor**: click a product name. You can set sale unit (per piece / by the metre), minimum length and cut step (e.g. min 1 m, steps of 0.25 m), variants (sizes S–XXL with their own stock), photos, specifications, tags and HSN/GST fields.
- **Status**: *Active* = visible on the website. *Draft* / *Archived* = hidden.
- **Featured** products appear on the homepage.
- **Photos**: JPEG/PNG/WebP up to 3 MB; first photo is the main image. Natural daylight, plain background, and one close-up of the weave/border work best. Until photos are added, a tasteful illustration is shown and labelled as such.
- **Stock tracking**: untick *Track stock* for made-to-order items.

## Demo products
The 64 seeded products are examples. They're labelled “Demo”, never shown as in stock, and hidden from Google. When real products are ready: Overview → **Hide all demo** (reversible) or delete them with `npm run db:remove-demo`.

## Bulk updates
Use **CSV import** (see [CSV-IMPORT.md](CSV-IMPORT.md)). Export first to get a spreadsheet of everything, edit prices/stock in Excel or Google Sheets, and re-import — rows are matched by `slug`.

## Security tips
- Use a long, unique password. To change it: `npm run admin:hash -- "new password"`, then update `ADMIN_PASSWORD_HASH` on Netlify and redeploy.
- Changing `SESSION_SECRET` signs everyone out.
- Never share the `SUPABASE_SERVICE_ROLE_KEY` or database password.
