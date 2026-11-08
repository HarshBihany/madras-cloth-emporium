/**
 * Declarative enquiry form definitions — shared by the client (rendering)
 * and the server (Zod schema generation), so validation can never drift.
 */
export type FieldDef = {
  name: string;
  label: string;
  kind: "text" | "tel" | "email" | "date" | "number" | "select" | "radio" | "checkboxes" | "textarea";
  required?: boolean;
  max?: number;
  options?: string[];
  placeholder?: string;
  half?: boolean;
  help?: string;
  autoComplete?: string;
};

const contactFields: FieldDef[] = [
  { name: "name", label: "Your name", kind: "text", required: true, max: 80, half: true, autoComplete: "name" },
  { name: "phone", label: "WhatsApp / mobile", kind: "tel", required: true, half: true, autoComplete: "tel", placeholder: "98XXXXXXXX" },
  { name: "email", label: "Email (optional)", kind: "email", half: true, autoComplete: "email" },
  { name: "city", label: "City (optional)", kind: "text", max: 60, half: true, autoComplete: "address-level2" },
  { name: "topic", label: "About", kind: "select", required: true, options: ["A product", "Store visit & timings", "Delivery", "Exchange or return", "Something else"] },
  { name: "message", label: "Message", kind: "textarea", required: true, max: 2000, placeholder: "How can we help?" },
];

const weddingFields: FieldDef[] = [
  { name: "name", label: "Your name", kind: "text", required: true, max: 80, half: true, autoComplete: "name" },
  { name: "phone", label: "WhatsApp / mobile", kind: "tel", required: true, half: true, autoComplete: "tel", placeholder: "98XXXXXXXX" },
  { name: "email", label: "Email (optional)", kind: "email", half: true, autoComplete: "email" },
  { name: "city", label: "City", kind: "text", max: 60, half: true, autoComplete: "address-level2" },
  { name: "weddingDate", label: "Wedding date (approx.)", kind: "date", half: true },
  { name: "role", label: "Shopping for", kind: "select", required: true, half: true, options: ["Bride", "Groom", "Bride's family", "Groom's family", "Guest"] },
  {
    name: "interests",
    label: "What do you need?",
    kind: "checkboxes",
    required: true,
    options: ["Bridal sarees", "Family & reception sarees", "Gifting sarees (in quantity)", "Suits & dress materials", "Kurtis", "Groom's suiting / bandhgala fabric", "Shirting for family", "Blouse & suit stitching"],
  },
  { name: "budget", label: "Approximate total budget", kind: "select", options: ["Under ₹25,000", "₹25,000 – ₹50,000", "₹50,000 – ₹1,00,000", "₹1,00,000 – ₹2,50,000", "Above ₹2,50,000", "Prefer to discuss"] },
  { name: "mode", label: "Preferred consultation", kind: "radio", required: true, options: ["Visit the store", "WhatsApp video call", "WhatsApp chat & photos"] },
  { name: "message", label: "Colours, styles or anything else", kind: "textarea", max: 2000, placeholder: "Colour themes, ceremonies, number of family members…" },
];

const bulkFields: FieldDef[] = [
  { name: "name", label: "Contact person", kind: "text", required: true, max: 80, half: true, autoComplete: "name" },
  { name: "phone", label: "WhatsApp / mobile", kind: "tel", required: true, half: true, autoComplete: "tel", placeholder: "98XXXXXXXX" },
  { name: "email", label: "Email", kind: "email", half: true, autoComplete: "email" },
  { name: "organisation", label: "Organisation / occasion", kind: "text", max: 120, half: true, autoComplete: "organization" },
  { name: "orgType", label: "Type", kind: "select", required: true, half: true, options: ["School / college", "Company / office", "Hospital / institution", "Event / function", "Wedding gifting", "Retailer / tailor", "Other"] },
  { name: "city", label: "Delivery city", kind: "text", max: 60, half: true },
  {
    name: "products",
    label: "Products needed",
    kind: "checkboxes",
    required: true,
    options: ["Uniform shirting", "Uniform suiting / trouser fabric", "Sarees", "Suits & dress materials", "Kurtis", "Stitching / tailoring"],
  },
  { name: "quantity", label: "Approximate quantity", kind: "text", required: true, max: 120, half: true, placeholder: "e.g. 300 metres, 80 sarees" },
  { name: "requiredBy", label: "Needed by", kind: "date", half: true },
  { name: "message", label: "Details (colours, sizes, specifications)", kind: "textarea", max: 3000 },
];

const tailoringFields: FieldDef[] = [
  { name: "name", label: "Your name", kind: "text", required: true, max: 80, half: true, autoComplete: "name" },
  { name: "phone", label: "WhatsApp / mobile", kind: "tel", required: true, half: true, autoComplete: "tel", placeholder: "98XXXXXXXX" },
  { name: "email", label: "Email (optional)", kind: "email", half: true, autoComplete: "email" },
  { name: "city", label: "City", kind: "text", max: 60, half: true },
  {
    name: "garment",
    label: "Garment",
    kind: "select",
    required: true,
    half: true,
    options: ["Saree blouse", "Salwar suit", "Kurti", "Men's kurta", "Shirt", "Trousers", "Two-piece suit", "Three-piece suit", "Safari suit", "Bandhgala / Jodhpuri", "Other"],
  },
  { name: "pieces", label: "Number of pieces", kind: "number", required: true, half: true, max: 500 },
  { name: "fabric", label: "Fabric", kind: "radio", required: true, options: ["I'll buy fabric from you", "I have my own fabric", "Not sure yet"] },
  { name: "product", label: "Product link or name (if chosen)", kind: "text", max: 200 },
  { name: "measurements", label: "Measurements", kind: "radio", required: true, options: ["I'll visit the store to be measured", "I'll share measurements on WhatsApp", "I have a sample garment"] },
  { name: "requiredBy", label: "Needed by", kind: "date", half: true },
  { name: "message", label: "Design notes", kind: "textarea", max: 2000, placeholder: "Neckline, sleeves, fit, reference photos you'll share on WhatsApp…" },
];

export const FORMS = {
  contact: { fields: contactFields, title: "Customer enquiry" },
  wedding: { fields: weddingFields, title: "Wedding consultation" },
  bulk: { fields: bulkFields, title: "Bulk order quotation" },
  tailoring: { fields: tailoringFields, title: "Custom tailoring request" },
} as const;

export type FormType = keyof typeof FORMS;
