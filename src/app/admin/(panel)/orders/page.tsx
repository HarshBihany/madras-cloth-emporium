import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listOrders } from "@/lib/data/admin";
import { AdminHeader, Pager, Pill, STATUS_TONE, sp1 } from "@/components/admin/ui";
import { formatPaise } from "@/lib/money";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { orderStatusEnum } from "@/lib/db/schema";

export const metadata = { title: "Orders" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = (orderStatusEnum.enumValues as readonly string[]).includes(sp1(sp.status)) ? sp1(sp.status) : "";
  const q = sp1(sp.q);
  const { rows, total, page, pages } = await listOrders({ status, q, page: Number(sp1(sp.page)) || 1 });
  const href = (p: number) => `/admin/orders?${new URLSearchParams({ ...(status && { status }), ...(q && { q }), page: String(p) })}`;

  return (
    <>
      <AdminHeader title="Orders" sub={`${total} order requests. New website orders arrive as "Received" — confirm them after speaking to the customer.`} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {["", ...orderStatusEnum.enumValues].map((s) => (
          <Link key={s || "all"} href={s ? `/admin/orders?status=${s}` : "/admin/orders"} className={`chip !min-h-9 !py-1 text-xs ${status === s ? "is-active" : ""}`} aria-current={status === s ? "page" : undefined}>
            {s ? ORDER_STATUS_LABEL[s as keyof typeof ORDER_STATUS_LABEL] : "All"}
          </Link>
        ))}
        <form method="get" className="ml-auto flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Order no., name or phone" aria-label="Search orders" className="field !min-h-9 !py-1 text-sm" />
          <button className="btn btn-outline !min-h-9 !px-3 !py-1 !text-[0.65rem]">Search</button>
        </form>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-sand bg-white">
        <table className="w-full min-w-[48rem] text-sm">
          <thead className="bg-cream/60 text-left text-xs uppercase tracking-wider text-stone">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-3 py-3">Customer</th>
              <th className="px-3 py-3">Items</th>
              <th className="px-3 py-3">Total</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand">
            {rows.map(({ o, itemCount }) => (
              <tr key={o.id} className="hover:bg-ivory">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold text-maroon hover:underline">
                    {o.orderNumber}
                  </Link>
                  {o.containsDemoItems && (
                    <span className="ml-2">
                      <Pill tone="gold">demo items</Pill>
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">
                  {o.customerName}
                  <div className="text-xs text-stone">
                    {o.phone} · {o.fulfilment === "pickup" ? "Pickup" : o.city}
                  </div>
                </td>
                <td className="px-3 py-3">{itemCount}</td>
                <td className="px-3 py-3 font-semibold">{formatPaise(o.totalPaise)}</td>
                <td className="px-3 py-3">
                  <Pill tone={STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Pill>
                </td>
                <td className="px-3 py-3 text-stone">{o.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-stone">
                  No orders here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} href={href} />
    </>
  );
}
