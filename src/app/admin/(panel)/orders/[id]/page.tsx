import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { getOrder } from "@/lib/data/admin";
import { AdminHeader, Card, Pill, STATUS_TONE } from "@/components/admin/ui";
import { formatPaise, formatQty } from "@/lib/money";
import { ORDER_STATUS_LABEL, ORDER_TRANSITIONS } from "@/lib/order-status";
import { OrderUpdateForm } from "@/components/admin/OrderUpdateForm";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";
import { paymentsEnabled } from "@/lib/integrations/payments";

export const metadata = { title: "Order" };

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const o = await getOrder(id);
  if (!o) notFound();
  const waCustomer = `https://wa.me/91${o.phone}?text=${encodeURIComponent(`Hello ${o.customerName}, this is Madras Cloth Emporium about your order ${o.orderNumber}.`)}`;

  return (
    <>
      <AdminHeader
        title={o.orderNumber}
        sub={
          <>
            <Link href="/admin/orders">← Orders</Link> · placed {o.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}
          </>
        }
        actions={
          <a href={waCustomer} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp !min-h-10 !px-4 !py-2">
            <WhatsAppIcon className="h-4 w-4" /> Message customer
          </a>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl">Items</h2>
              <Pill tone={STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Pill>
            </div>
            {o.containsDemoItems && <p className="mt-2 rounded-lg bg-gold-pale/50 px-3 py-2 text-xs text-gold-deep">Contains demo listings — suggest real alternatives to the customer. Demo items never change stock.</p>}
            <table className="mt-4 w-full text-sm">
              <tbody className="divide-y divide-sand">
                {o.items.map((i) => (
                  <tr key={i.id}>
                    <td className="py-3">
                      {i.productId ? (
                        <Link href={`/admin/products/${i.productId}`} className="font-semibold hover:text-maroon">
                          {i.productName}
                        </Link>
                      ) : (
                        <span className="font-semibold">{i.productName}</span>
                      )}
                      {i.variantLabel && <span className="text-stone"> · {i.variantLabel}</span>}
                      {i.isDemo && (
                        <span className="ml-2">
                          <Pill tone="gold">demo</Pill>
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-stone">
                      {formatQty(i.saleUnit, i.quantity)} × {formatPaise(i.unitPricePaise)}
                    </td>
                    <td className="py-3 text-right font-semibold">{formatPaise(i.lineTotalPaise)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="text-sm">
                <tr>
                  <td colSpan={2} className="pt-3 text-right text-stone">
                    Subtotal
                  </td>
                  <td className="pt-3 text-right">{formatPaise(o.subtotalPaise)}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="text-right text-stone">
                    Shipping
                  </td>
                  <td className="text-right">{formatPaise(o.shippingPaise)}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="text-right text-stone">
                    Discount
                  </td>
                  <td className="text-right">−{formatPaise(o.discountPaise)}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="pt-2 text-right font-semibold">
                    Total
                  </td>
                  <td className="pt-2 text-right font-display text-2xl text-maroon">{formatPaise(o.totalPaise)}</td>
                </tr>
              </tfoot>
            </table>
          </Card>
          <Card>
            <h2 className="text-2xl">Customer</h2>
            <dl className="mt-3 grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
              <dt className="text-stone">Name</dt>
              <dd>{o.customerName}</dd>
              <dt className="text-stone">Phone</dt>
              <dd>
                <a href={`tel:+91${o.phone}`} className="text-maroon underline">
                  +91 {o.phone}
                </a>
              </dd>
              {o.email && (
                <>
                  <dt className="text-stone">Email</dt>
                  <dd>
                    <a href={`mailto:${o.email}`} className="text-maroon underline">
                      {o.email}
                    </a>
                  </dd>
                </>
              )}
              <dt className="text-stone">Fulfilment</dt>
              <dd>{o.fulfilment === "pickup" ? "Store pickup" : [o.addressLine, o.city, o.state, o.pincode].filter(Boolean).join(", ")}</dd>
              {o.customerNotes && (
                <>
                  <dt className="text-stone">Notes</dt>
                  <dd className="whitespace-pre-line">{o.customerNotes}</dd>
                </>
              )}
            </dl>
          </Card>
          <Card>
            <h2 className="text-2xl">History</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {o.events.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <time className="w-40 shrink-0 text-stone">{e.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}</time>
                  <span>
                    <strong>{ORDER_STATUS_LABEL[e.status]}</strong>
                    {e.note ? ` — ${e.note}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div>
          <OrderUpdateForm
            order={{
              id: o.id,
              status: o.status,
              paymentStatus: o.paymentStatus,
              paymentProvider: o.paymentProvider ?? "",
              paymentRef: o.paymentRef ?? "",
              courier: o.courier ?? "",
              trackingNumber: o.trackingNumber ?? "",
              shipping: o.shippingPaise / 100,
              discount: o.discountPaise / 100,
              adminNotes: o.adminNotes ?? "",
              stockDeducted: o.stockDeducted,
            }}
            next={ORDER_TRANSITIONS[o.status]}
            paymentsLive={paymentsEnabled()}
          />
        </div>
      </div>
    </>
  );
}
