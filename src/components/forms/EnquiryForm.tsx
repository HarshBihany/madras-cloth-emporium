"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitEnquiry, type EnquiryState } from "@/app/actions/enquiry";
import { FORMS, type FieldDef, type FormType } from "@/lib/forms";
import { WhatsAppAutoOpen } from "./WhatsAppAutoOpen";

export function EnquiryForm({ type, submitLabel, defaults = {} }: { type: FormType; submitLabel: string; defaults?: Record<string, string> }) {
  const [state, action, pending] = useActionState<EnquiryState, FormData>(submitEnquiry, { status: "idle" });

  if (state.status === "success")
    return (
      <div role="status" className="rounded-[1.75rem] border border-sand bg-white/70 p-8 text-center sm:p-10">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden />
        <h3 className="mt-4 text-3xl">Thank you — we&apos;ve received it.</h3>
        <p className="mt-2 text-charcoal-soft">
          Reference <strong className="font-mono text-maroon">{state.reference}</strong>. Your request is saved and our team has been notified.
          We&apos;re now opening WhatsApp with your details so you can reach us directly.
        </p>
        <WhatsAppAutoOpen url={state.whatsappUrl} label="Send on WhatsApp" />
      </div>
    );

  const errors = state.status === "error" ? state.fieldErrors : {};
  const values = state.status === "error" ? state.values : {};
  const val = (f: FieldDef) => {
    const v = values[f.name];
    return typeof v === "string" ? v : (defaults[f.name] ?? "");
  };
  const checked = (f: FieldDef, o: string) => {
    const v = values[f.name];
    return Array.isArray(v) ? v.includes(o) : v === o;
  };
  // remount inputs when the server returns values, so defaultValue updates
  const k = state.status === "error" ? JSON.stringify(values).length : 0;

  return (
    <form action={action} noValidate className="grid gap-5 sm:grid-cols-2" key={k}>
      <input type="hidden" name="formType" value={type} />
      {FORMS[type].fields.map((f) => {
        const id = `${type}-${f.name}`;
        const err = errors[f.name];
        const common = {
          id,
          name: f.name,
          "aria-invalid": !!err,
          "aria-describedby": err ? `${id}-err` : f.help ? `${id}-help` : undefined,
          required: f.required,
        };
        const label = (
          <>
            {f.label}
            {f.required && <span aria-hidden className="text-maroon"> *</span>}
          </>
        );
        const errEl = err && (
          <p id={`${id}-err`} className="mt-1.5 text-xs font-medium text-danger">
            {err}
          </p>
        );
        const span = f.half ? "" : "sm:col-span-2";

        if (f.kind === "checkboxes" || f.kind === "radio")
          return (
            <fieldset key={f.name} className={span} aria-describedby={err ? `${id}-err` : undefined}>
              <legend className="field-label">{label}</legend>
              <div className="flex flex-wrap gap-2">
                {f.options!.map((o) => (
                  <label key={o} className="chip has-[:checked]:border-maroon has-[:checked]:bg-maroon has-[:checked]:text-ivory has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-maroon">
                    <input type={f.kind === "radio" ? "radio" : "checkbox"} name={f.name} value={o} defaultChecked={checked(f, o)} className="sr-only" />
                    {o}
                  </label>
                ))}
              </div>
              {errEl}
            </fieldset>
          );

        return (
          <div key={f.name} className={span}>
            <label htmlFor={id} className="field-label">
              {label}
            </label>
            {f.kind === "textarea" ? (
              <textarea {...common} maxLength={f.max} placeholder={f.placeholder} defaultValue={val(f)} className="field" />
            ) : f.kind === "select" ? (
              <select {...common} defaultValue={val(f)} className="field">
                <option value="">Choose…</option>
                {f.options!.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                {...common}
                type={f.kind === "tel" ? "tel" : f.kind}
                inputMode={f.kind === "tel" ? "tel" : f.kind === "number" ? "numeric" : undefined}
                min={f.kind === "number" ? 1 : undefined}
                max={f.kind === "number" ? f.max : undefined}
                maxLength={f.kind === "text" ? f.max : undefined}
                autoComplete={f.autoComplete}
                placeholder={f.placeholder}
                defaultValue={val(f)}
                className="field"
              />
            )}
            {errEl}
          </div>
        );
      })}

      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${type}-website`}>Website</label>
        <input id={`${type}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-3 text-sm text-charcoal-soft sm:col-span-2">
        <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-maroon" aria-invalid={!!errors.consent} />
        <span>
          I agree to be contacted on WhatsApp, phone or email about this request, as described in the{" "}
          <Link href="/policies#privacy" className="link-underline text-maroon">
            privacy notice
          </Link>
          .{errors.consent && <span className="ml-2 font-medium text-danger">Required</span>}
        </span>
      </label>

      {state.status === "error" && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger sm:col-span-2">
          {state.message}
        </p>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="btn btn-primary w-full sm:w-auto">
          {pending ? "Sending…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
