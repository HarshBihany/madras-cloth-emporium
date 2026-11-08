import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { listAdminProducts, listCategoriesAdmin } from "@/lib/data/admin";
import { quickUpdateProduct } from "@/app/actions/admin";
import { AdminHeader, Pager, Pill, STATUS_TONE, sp1 } from "@/components/admin/ui";
import { formatPaise } from "@/lib/money";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminProducts({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const f = { q: sp1(sp.q), category: sp1(sp.category), status: sp1(sp.status), demo: sp1(sp.demo), page: Number(sp1(sp.page)) || 1 };
  const [{ rows, total, page, pages }, cats] = await Promise.all([listAdminProducts(f), listCategoriesAdmin()]);
  const qs = (p: number) => {
    const n = new URLSearchParams(Object.entries({ ...f, page: String(p) }).filter(([, v]) => v && v !== "1") as [string, string][]);
    return `/admin/products${n.size ? `?${n}` : ""}`;
  };

  return (
    <>
      <AdminHeader
        title="Products"
        sub={`${total} products · edit price, stock and status inline, then press Save on the row.`}
        actions={
          <>
            <a href="/api/admin/export" className="btn btn-outline !min-h-10 !px-4 !py-2">
              <Download className="h-4 w-4" aria-hidden /> Export CSV
            </a>
            <Link href="/admin/products/new" className="btn btn-primary !min-h-10 !px-4 !py-2">
              <Plus className="h-4 w-4" aria-hidden /> New product
            </Link>
          </>
        }
      />
      {sp.deleted && <p className="mb-4 rounded-xl bg-success/10 px-4 py-2 text-sm text-success">Product deleted.</p>}

      <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]" method="get">
        <label className="sr-only" htmlFor="pq">
          Search
        </label>
        <input id="pq" name="q" defaultValue={f.q} placeholder="Search name, slug or SKU" className="field !min-h-10 !py-2 text-sm" />
        <select name="category" defaultValue={f.category} aria-label="Category" className="field !min-h-10 !py-2 text-sm">
          <option value="">All categories</option>
          {cats.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={f.status} aria-label="Status" className="field !min-h-10 !py-2 text-sm">
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select name="demo" defaultValue={f.demo} aria-label="Demo" className="field !min-h-10 !py-2 text-sm">
          <option value="">Real & demo</option>
          <option value="no">Real only</option>
          <option value="yes">Demo only</option>
        </select>
        <button className="btn btn-outline !min-h-10 !px-4 !py-2">Filter</button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-sand bg-white">
        <table className="w-full min-w-[56rem] text-sm">
          <thead className="bg-cream/60 text-left text-xs uppercase tracking-wider text-stone">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-3 py-3 font-semibold">Category</th>
              <th className="px-3 py-3 font-semibold">Price (₹)</th>
              <th className="px-3 py-3 font-semibold">Stock</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-sand">
            {rows.map(({ p, categoryName, variantCount }) => {
              const formId = `q-${p.id}`;
              return (
                <tr key={p.id} className="align-middle hover:bg-ivory">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="font-semibold hover:text-maroon">
                      {p.name}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-stone">
                      <span className="font-mono">{p.slug}</span>
                      {p.isDemo && <Pill tone="gold">Demo</Pill>}
                      {p.featured && <Pill tone="maroon">Featured</Pill>}
                      {variantCount > 0 && <Pill>{variantCount} variants</Pill>}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-stone">{categoryName}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <input form={formId} name="price" type="number" step="0.01" min="0" defaultValue={p.pricePaise / 100} aria-label={`Price for ${p.name}`} className="field !inline-block !min-h-9 !w-28 !px-2 !py-1" />
                    {p.saleUnit === "metre" && <span className="ml-1 text-xs text-stone">/m</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <input
                      form={formId}
                      name="stock"
                      type="number"
                      step={p.saleUnit === "metre" ? "0.25" : "1"}
                      min="0"
                      defaultValue={p.stockQty}
                      disabled={variantCount > 0}
                      title={variantCount > 0 ? "Stock is managed per variant — open the product" : undefined}
                      aria-label={`Stock for ${p.name}`}
                      className="field !inline-block !min-h-9 !w-24 !px-2 !py-1 disabled:opacity-60"
                    />
                    {!p.trackStock && <span className="ml-1 text-xs text-stone">untracked</span>}
                  </td>
                  <td className="px-3 py-3">
                    <select form={formId} name="status" defaultValue={p.status} aria-label={`Status for ${p.name}`} className="field !min-h-9 !w-28 !px-2 !py-1 text-sm">
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <form id={formId} action={quickUpdateProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      {variantCount > 0 && <input type="hidden" name="stock" value={p.stockQty} />}
                      <button className="btn btn-outline !min-h-9 !px-3 !py-1 !text-[0.65rem]">Save</button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-stone">
                  No products match. <Link href="/admin/products/new" className="text-maroon underline">Add one</Link> or{" "}
                  <Link href="/admin/import" className="text-maroon underline">import a CSV</Link>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} href={qs} />
      <p className="mt-4 text-xs text-stone">
        Status pill legend: <Pill tone={STATUS_TONE.active}>active</Pill> visible on site · <Pill tone={STATUS_TONE.draft}>draft</Pill> hidden ·{" "}
        <Pill tone={STATUS_TONE.archived}>archived</Pill> hidden. Prices shown e.g. {formatPaise(129900)} are entered in rupees.
      </p>
    </>
  );
}
