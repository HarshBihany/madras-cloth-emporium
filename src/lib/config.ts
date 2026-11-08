/**
 * Single source of truth for business details.
 * Edit here; every page, form, WhatsApp link and JSON-LD block reads from it.
 */
export const business = {
  name: "Madras Cloth Emporium",
  shortName: "Madras Cloth",
  established: 1970,
  tagline: "Sarees, suits & fine fabrics since 1970",
  address: {
    street: "Bypass Road",
    locality: "Chas",
    city: "Bokaro",
    district: "Bokaro",
    state: "Jharkhand",
    country: "IN",
    // Pincode is not confirmed yet — add it when known (e.g. "827013").
    postalCode: null as string | null,
  },
  // WhatsApp number in international format without "+" (used by wa.me links)
  whatsapp: "919835925598",
  phoneDisplay: "+91 98359 25598",
  phoneTel: "+919835925598",
  email: "sanjayyes9@gmail.com",
  // Store hours are not confirmed. Leave null to show "call to confirm".
  hours: null as string | null,
  mapsQuery: "Madras Cloth Emporium, Bypass Road, Chas, Bokaro, Jharkhand",
  deliveryNote: "Pan-India delivery available on request — confirm charges on WhatsApp.",
} as const;

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const fullAddress = [
  business.address.street,
  business.address.locality,
  business.address.city,
  business.address.state,
  business.address.postalCode,
]
  .filter(Boolean)
  .join(", ");

export const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(business.mapsQuery)}&z=15&output=embed`;
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.mapsQuery)}`;

export function whatsappUrl(text?: string) {
  const base = `https://wa.me/${business.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function yearsSince() {
  return new Date().getFullYear() - business.established;
}
