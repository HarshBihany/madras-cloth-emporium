"use client";

import { useActionState } from "react";
import { updateOrder, type OrderUpdateState } from "@/app/actions/admin";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import type { OrderStatus, PaymentStatus } from "@/lib/db/schema";

type O = {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider: string;
  paymentRef: string;
  courier: string;
  trackingNumber: string;
  shipping: number;
  discount: number;
  adminNotes: string;
  stockDeducted: boolean;
};

export function OrderUpdateForm({ order, next, paymentsLive }: { order: O; next: OrderStatus[]; paymentsLive: boolean }) {
  const [state, action, pending] = useActionState<OrderUpdateState, FormData>(updateOrder, {});
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-sand bg-white p-5 xl:sticky xl:top-6">
      <h2 className="text-2xl">Update order</h2>
      <input type="hidden" name="id" value={order.id} />
      <div>
        <label htmlFor="o-status" className="field-label">
          Status
        </label>
        <select id="o-status" name="status" defaultValue={order.status} className="field">
          <option value={order.status}>{ORDER_STATUS_LABEL[order.status]} (current)</option>
          {next.map((s) => (
            <option key={s} value={s}>
              → {ORDER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-stone">
          {order.stockDeducted ? "Stock has been deducted. Cancelling restores it." : "Stock is deducted when you confirm (real, tracked items only)."}
        </p>
      </div>
      <div>
        <label htmlFor="o-note" className="field-label">
          Note for history (visible to customer on tracking)
        </label>
        <input id="o-note" name="note" maxLength={300} className="field" placeholder="e.g. Payment received via UPI" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="o-ship" className="field-label">
            Shipping ₹
          </label>
          <input id="o-ship" name="shipping" type="number" min="0" step="1" defaultValue={order.shipping} className="field" />
        </div>
        <div>
          <label htmlFor="o-disc" className="field-label">
            Discount ₹
          </label>
          <input id="o-disc" name="discount" type="number" min="0" step="1" defaultValue={order.discount} className="field" />
        </div>
      </div>
      <fieldset className="space-y-3 rounded-xl bg-cream/50 p-3">
        <legend className="field-label">Payment {paymentsLive ? "" : "(recorded manually)"}</legend>
        <select name="paymentStatus" defaultValue={order.paymentStatus} aria-label="Payment status" className="field">
          <option value="unpaid">Unpaid</option>
          <option value="partially_paid">Partially paid</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input name="paymentProvider" defaultValue={order.paymentProvider} placeholder="Method (UPI, cash…)" aria-label="Payment method" className="field" />
          <input name="paymentRef" defaultValue={order.paymentRef} placeholder="Reference / UTR" aria-label="Payment reference" className="field" />
        </div>
      </fieldset>
      <fieldset className="space-y-3 rounded-xl bg-cream/50 p-3">
        <legend className="field-label">Shipping</legend>
        <div className="grid grid-cols-2 gap-3">
          <input name="courier" defaultValue={order.courier} placeholder="Courier" aria-label="Courier" className="field" />
          <input name="trackingNumber" defaultValue={order.trackingNumber} placeholder="Tracking no." aria-label="Tracking number" className="field" />
        </div>
      </fieldset>
      <div>
        <label htmlFor="o-notes" className="field-label">
          Internal notes (staff only)
        </label>
        <textarea id="o-notes" name="adminNotes" defaultValue={order.adminNotes} className="field !min-h-20" />
      </div>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`rounded-xl px-3 py-2 text-sm font-medium ${state.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
