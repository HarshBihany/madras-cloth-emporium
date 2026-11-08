import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { getDashboardStats } from "@/lib/data/admin";
import { formatPaise, formatQty } from "@/lib/money";
import { AdminHeader, Card, Pill, STATUS_TONE } from "@/components/admin/ui";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { bulkDemoAction } from "@/app/actions/admin";

export default async function AdminHome() {
  await requireAdmin();
  const s = await getDashboardStats();
  const tiles = [
    { label: "Orders awaiting confirmation", value: s.orders.pending, href: "/admin/orders?status=pending", alert: s.orders.pending > 0 },
    { label: "New enquiries", value: s.enquiries.fresh, href: "/admin/enquiries?status=new", alert: s.enquiries.fresh > 0 },
    { label: "Orders in progress", value: s.orders.open, href: "/admin/orders" },
    { label: "Active products", value: s.products.active, href: "/admin/products?status=active" },
  ];
  return (
    <>
      <AdminHeader title="Overview" sub={`Last 30 days: ${s.orders.last30} order requests · ${formatPaise(s.orders.value30)} (excluding demo & cancelled)`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 ${t.alert ? "border-maroon/30 bg-maroon text-ivory" : "border-sand bg-white"}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${t.alert ? "text-gold-light" : "text-stone"}`}>{t.label}</p>
            <p className="mt-2 font-display text-5xl">{t.value}</p>
          </Link>
        ))}
      </div>

      {s.products.demo > 0 && (
        <Card className="mt-6 border-gold/50 bg-gold-pale/40">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" aria-hidden />
              <div>
                <p className="font-semibold">
                  {s.products.demo} demonstration products · {s.products.real} real products
                </p>
                <p className="mt-1 text-sm text-charcoal-soft">
                  Demo listings are clearly labelled on the site and never shown as in stock. Hide or delete them once your real catalogue is uploaded.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={bulkDemoAction}>
                <input type="hidden" name="action" value="hide-demo" />
                <button className="btn btn-outline !min-h-9 !px-4 !py-1 !text-[0.65rem]">Hide all demo</button>
              </form>
              <form action={bulkDemoAction}>
                <input type="hidden" name="action" value="show-demo" />
                <button className="btn btn-outline !min-h-9 !px-4 !py-1 !text-[0.65rem]">Show all demo</button>
              </form>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-maroon">
              All orders <ArrowRight className="inline h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          {s.recentOrders.length ? (
            <ul className="divide-y divide-sand text-sm">
              {s.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-maroon">
                    <span>
                      <span className="font-mono">{o.orderNumber}</span>
                      <span className="ml-2 text-stone">{o.customerName}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <Pill tone={STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Pill>
                      <span className="w-20 text-right font-semibold">{formatPaise(o.totalPaise)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone">No orders yet. Orders from the website cart appear here.</p>
          )}
        </Card>
        <Card>
          <h2 className="mb-4 text-2xl">Low stock</h2>
          {s.lowStock.length ? (
            <ul className="divide-y divide-sand text-sm">
              {s.lowStock.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}`} className="flex justify-between gap-3 py-3 hover:text-maroon">
                    <span>{p.name}</span>
                    <span className={p.stockQty <= 0 ? "font-semibold text-danger" : "font-semibold text-gold-deep"}>{formatQty(p.saleUnit, p.stockQty)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone">Nothing low on stock among real, tracked products.</p>
          )}
        </Card>
      </div>
    </>
  );
}
