"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { FORMS, type FieldDef, type FormType } from "@/lib/forms";
import { indianPhone, optionalEmail, optionalText, text, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { whatsappUrl } from "@/lib/config";
import { notifyOwner } from "@/lib/integrations/email";

export type EnquiryState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors: FieldErrors; values: Record<string, string | string[]> }
  | { status: "success"; reference: string; whatsappUrl: string };

const dateRe = /^\d{4}-\d{2}-\d{2}$/;

function fieldSchema(f: FieldDef): z.ZodType {
  switch (f.kind) {
    case "tel":
      return indianPhone;
    case "email":
      return f.required ? z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address").max(120)) : optionalEmail;
    case "date":
      return z
        .string()
        .optional()
        .transform((v) => v ?? "")
        .refine((v) => {
          if (!v) return !f.required;
          if (!dateRe.test(v)) return false;
          const t = Date.parse(v);
          const now = Date.now();
          return t > now - 86_400_000 * 2 && t < now + 86_400_000 * 365 * 3;
        }, "Choose a date from today up to 3 years ahead");
    case "number":
      return z.coerce.number({ error: "Enter a number" }).int("Whole numbers only").min(f.required ? 1 : 0, "Must be at least 1").max(f.max ?? 10000);
    case "select":
    case "radio":
      return f.required
        ? z.enum(f.options as [string, ...string[]], { error: `Please choose ${f.label.toLowerCase()}` })
        : z.union([z.literal(""), z.enum(f.options as [string, ...string[]])]).optional().transform((v) => v ?? "");
    case "checkboxes": {
      const arr = z.array(z.enum(f.options as [string, ...string[]]));
      return f.required ? arr.min(1, "Choose at least one option") : arr;
    }
    default:
      return f.required ? text(f.max ?? 500, f.kind === "textarea" ? 5 : 2) : optionalText(f.max ?? 500);
  }
}

function schemaFor(type: FormType) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of FORMS[type].fields) shape[f.name] = fieldSchema(f);
  return z.object(shape);
}

function readValues(type: FormType, fd: FormData) {
  const values: Record<string, string | string[]> = {};
  for (const f of FORMS[type].fields) {
    if (f.kind === "checkboxes") values[f.name] = fd.getAll(f.name).filter((x): x is string => typeof x === "string").slice(0, 20);
    else {
      const v = fd.get(f.name);
      values[f.name] = typeof v === "string" ? v.slice(0, 5000) : "";
    }
  }
  return values;
}

export async function submitEnquiry(_prev: EnquiryState, fd: FormData): Promise<EnquiryState> {
  const type = fd.get("formType");
  if (typeof type !== "string" || !(type in FORMS)) return { status: "error", message: "Unknown form.", fieldErrors: {}, values: {} };
  const t = type as FormType;
  const values = readValues(t, fd);

  // Honeypot: silently "succeed" for bots without storing anything
  if (typeof fd.get("website") === "string" && (fd.get("website") as string).length > 0) {
    return { status: "success", reference: "—", whatsappUrl: whatsappUrl() };
  }
  const parsed = schemaFor(t).safeParse(values);
  const consent = fd.get("consent") === "on";
  if (!parsed.success || !consent) {
    const fieldErrors = parsed.success ? {} : toFieldErrors(parsed.error);
    if (!consent) fieldErrors.consent = "Required";
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values };
  }

  if (!(await rateLimit(`enquiry`, 8, 60 * 30))) {
    return { status: "error", message: "Too many submissions from this connection. Please message us on WhatsApp instead.", fieldErrors: {}, values };
  }

  const data = parsed.data as Record<string, string | string[] | number>;
  const { name, phone, email, city, message, ...rest } = data;
  const details: Record<string, string> = {};
  for (const [k, v] of Object.entries(rest)) {
    const s = Array.isArray(v) ? v.join(", ") : String(v ?? "");
    if (s) details[k] = s;
  }

  try {
    const [row] = await db
      .insert(enquiries)
      .values({
        type: t,
        name: String(name),
        phone: String(phone),
        email: email ? String(email) : null,
        city: city ? String(city) : null,
        message: message ? String(message) : null,
        details,
      })
      .returning({ id: enquiries.id });

    const reference = `ENQ-${row.id.slice(0, 8).toUpperCase()}`;
    const labels = Object.fromEntries(FORMS[t].fields.map((f) => [f.name, f.label]));
    const summary = [
      `*${FORMS[t].title}* (${reference})`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      email ? `Email: ${email}` : "",
      city ? `City: ${city}` : "",
      ...Object.entries(details).map(([k, v]) => `${labels[k] ?? k}: ${v}`),
      message ? `\n${message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await notifyOwner(`${FORMS[t].title} from ${name}`, summary, {
      replyTo: email ? String(email) : null,
      adminPath: `/admin/enquiries?type=${t}`,
    });
    return { status: "success", reference, whatsappUrl: whatsappUrl(summary) };
  } catch (e) {
    console.error("submitEnquiry failed", e);
    return { status: "error", message: "We couldn't save your request. Please try again or message us on WhatsApp.", fieldErrors: {}, values };
  }
}
