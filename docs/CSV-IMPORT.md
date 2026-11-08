# CSV product import

Admin → **CSV import** → download the template → fill it in Excel/Google Sheets → *File → Download → CSV* → upload → **preview** → **confirm**.
If any row has an error, nothing is imported and every problem is listed with its row number.

| Column | Required | Example | Notes |
|---|---|---|---|
| `name` | ✅ | Maroon Silk Saree with Temple Border | 3–140 characters |
| `category` | ✅ | `sarees` | `sarees`, `suits-dress-materials`, `kurtis`, `shirting-fabrics`, `suiting-fabrics` (or the category name) |
| `price` | ✅ | `4890` | Rupees. For metre items: price **per metre** |
| `slug` | | `maroon-silk-saree` | Web address. Auto-made from the name if blank. **Used to match existing products** |
| `sale_unit` | | `piece` / `metre` | Defaults from category |
| `mrp` | | `5600` | Shows strike-through + % off |
| `stock` | | `3` or `85.5` | Pieces, or metres for metre items |
| `min_qty`, `qty_step` | | `1`, `0.25` | Minimum and cut step (metre items) |
| `track_stock` | | `yes` | `no` for made-to-order |
| `low_stock_threshold` | | `3` | Low-stock alert level |
| `fabric`, `colour`, `occasion`, `work` | | Silk Blend, Maroon, Wedding, Zari woven | Power the filters — keep spellings consistent |
| `width_inches` | | `58` | Fabric width |
| `short_description`, `description`, `care` | | | |
| `tags` | | `bridal\|festive` | Separate with `\|` |
| `images` | | `https://…/1.jpg\|https://…/2.jpg` | https links, separated by `\|` |
| `variants` | | `S:2\|M:5\|L:0` or `Red:3:1299` | `label:stock` or `label:stock:price`. Leave blank to keep existing variants |
| `status` | | `draft` | `draft` (default), `active`, `archived` |
| `featured`, `is_demo` | | `yes` / `no` | |
| `sku`, `hsn_code`, `gst_rate` | | `MCE-SAR-001`, `5007`, `5` | GST fields are for future invoicing — confirm with your CA |
| `attr_<name>` | | `attr_Blouse piece` = `Included` | Any extra specification columns |

**Tips**
- Start with `status = draft`, review on the website admin, then switch to `active`.
- Keep the file under 2,000 rows / 2 MB; split larger files.
- Export is in the same format, so *export → edit → import* is the easiest way to update prices in bulk.
