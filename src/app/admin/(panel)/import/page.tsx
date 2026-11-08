import { requireAdmin } from "@/lib/auth/session";
import { listCategoriesAdmin } from "@/lib/data/admin";
import { AdminHeader, Card } from "@/components/admin/ui";
import { ImportForm } from "@/components/admin/ImportForm";

export const metadata = { title: "CSV import" };

export default async function ImportPage() {
  await requireAdmin();
  const cats = await listCategoriesAdmin();
  return (
    <>
      <AdminHeader title="CSV import" sub="Move your manual stock register into the website in one go. Rows are matched by slug: existing products are updated, new ones created." />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <ImportForm />
        <Card>
          <h2 className="text-2xl">How it works</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-charcoal-soft">
            <li>
              <a href="/api/admin/csv-template" className="font-semibold text-maroon underline">
                Download the template
              </a>{" "}
              and open it in Excel or Google Sheets.
            </li>
            <li>One product per row. Required: <code>name</code>, <code>category</code>, <code>price</code> (rupees).</li>
            <li>
              <code>sale_unit</code>: <code>piece</code> or <code>metre</code>. For metre items, <code>stock</code> is in metres (e.g. 85.5).
            </li>
            <li>
              <code>variants</code>: <code>S:2|M:5|L:0</code> (label:stock) or <code>Red:3:1299</code> (label:stock:price).
            </li>
            <li>
              <code>tags</code> and <code>images</code> are separated by <code>|</code>. Images must be https:// links.
            </li>
            <li>New rows default to <code>draft</code> so you can review before going live.</li>
            <li>Upload → review the preview → confirm. Any error means nothing is imported.</li>
          </ol>
          <h3 className="mt-5 text-lg">Category values</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {cats.map((c) => (
              <li key={c.id}>
                <code>{c.slug}</code> <span className="text-stone">— {c.name}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
