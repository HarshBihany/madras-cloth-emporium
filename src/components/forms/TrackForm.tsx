"use client";

import { useActionState } from "react";
import { trackOrder, type TrackState } from "@/app/actions/track";
import { formatPaise, formatQty } from "@/lib/money";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";

const STEPS = ["pending", "confirmed", "packed", "shipped", "delivered"] as const;

export function TrackForm() {
  const [state, action, pending] = useActionState<TrackState, FormData>(trackOrder, { status: "idle" });

  return (
    <>
      <form action={action} className="mt-10 grid gap-4 rounded-[1.75rem] border border-sand bg-white/60 p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-8">
        <div>
          <label htmlFor="t-order" className="field-label">
            Order reference
          </label>
          <input id="t-order" name="orderNumber" required autoCapitalize="characters" placeholder="MCE-…" className="field font-mono uppercase" />
        </div>
        <div>
          <label htmlFor="t-phone" className="field-label">
            Phone number
          </label>
          <input id="t-phone" name="phone" type="tel" inputMode="tel" required className="field" />
        </div>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Checking…" : "Track"}
        </button>
      </form>

      {state.status === "error" && (
        <p role="alert" className="mt-6 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {state.message}
        </p>
      )}

      {state.status === "found" && (
        <section className="mt-10 rounded-[1.75rem] border border-sand p-6 sm:p-8" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-mono text-xl text-maroon">{state.order.orderNumber}</h2>
            <span className="rounded-full bg-maroon px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-ivory">{ORDER_STATUS_LABEL[state.order.status]}</span>
          </div>
          {state.order.status !== "cancelled" && state.order.status !== "completed" && (
            <ol className="mt-8 grid grid-cols-5 gap-2" aria-label="Progress">
              {STEPS.map((s, i) => {
                const reached = STEPS.indexOf(state.order.status as (typeof STEPS)[number]) >= i;
                return (
                  <li key={s} className="text-center">
                    <span className={`mx-auto block h-1.5 rounded-full ${reached ? "bg-maroon" : "bg-sand"}`} />
                    <span className={`mt-2 block text-[0.65rem] font-semibold uppercase tracking-wider ${reached ? "text-maroon" : "text-stone"}`}>{ORDER_STATUS_LABEL[s]}</span>
                  </li>
                );
              })}
            </ol>
          )}
          {state.order.trackingNumber && (
            <p className="mt-6 text-sm">
              Courier: <strong>{state.order.courier ?? "—"}</strong> · Tracking no. <strong className="font-mono">{state.order.trackingNumber}</strong>
            </p>
          )}
          <ul className="mt-6 divide-y divide-sand border-y border-sand text-sm">
            {state.order.items.map((i, k) => (
              <li key={k} className="flex justify-between gap-4 py-3">
                <span>
                  {i.name}
                  {i.variant ? ` (${i.variant})` : ""}
                </span>
                <span className="text-stone">{formatQty(i.unit as "piece" | "metre", i.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-right font-semibold">Estimated total {formatPaise(state.order.totalPaise)}</p>
          <h3 className="mt-8 text-xl">History</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {state.order.events.map((e, k) => (
              <li key={k} className="flex gap-3">
                <time className="w-36 shrink-0 text-stone" dateTime={e.at}>
                  {new Date(e.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </time>
                <span>
                  <strong>{ORDER_STATUS_LABEL[e.status]}</strong>
                  {e.note ? ` — ${e.note}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
