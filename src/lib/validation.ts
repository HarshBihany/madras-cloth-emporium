import { z } from "zod";

/** Strip control characters (keeps newlines/tabs) and trim. */
export function clean(s: string) {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

export const text = (max: number, min = 0) =>
  z
    .string()
    .transform(clean)
    .pipe(min ? z.string().min(min, `Please enter at least ${min} characters`).max(max, `Maximum ${max} characters`) : z.string().max(max, `Maximum ${max} characters`));

export const optionalText = (max: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? clean(v) : ""))
    .pipe(z.string().max(max, `Maximum ${max} characters`));

/** Indian mobile: accepts +91 / 0 prefixes, spaces, dashes. Normalises to 10 digits. */
export const indianPhone = z
  .string()
  .transform((v) => v.replace(/[\s\-().]/g, "").replace(/^(\+?91|0)(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"));

export const optionalEmail = z
  .string()
  .optional()
  .transform((v) => (v ? clean(v).toLowerCase() : ""))
  .pipe(z.union([z.literal(""), z.email("Enter a valid email address").max(120)]));

export const pincode = z
  .string()
  .transform((v) => v.replace(/\s/g, ""))
  .pipe(z.string().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code"));

export type FieldErrors = Record<string, string>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const i of error.issues) {
    const k = i.path.join(".") || "_";
    if (!out[k]) out[k] = i.message;
  }
  return out;
}

export function formDataToObject(fd: FormData) {
  const o: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string" && !k.startsWith("$ACTION")) o[k] = v;
  return o;
}
