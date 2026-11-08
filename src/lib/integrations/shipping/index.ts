/**
 * SHIPPING / COURIER TRACKING — integration point.
 *
 * v1: staff enter courier name + tracking number on the order page; customers see them on /track.
 * Later: implement a provider (e.g. Shiprocket, Delhivery, India Post) and call it from the admin
 * order page ("Create shipment") and from a scheduled sync or webhook to update statuses.
 * The orders table already stores courier + trackingNumber, and order_events stores history.
 */

export type Address = { name: string; phone: string; line1: string; city: string; state: string; pincode: string };
export type Parcel = { weightGrams: number; lengthCm: number; breadthCm: number; heightCm: number; declaredValuePaise: number };
export type TrackingEvent = { at: string; status: string; location?: string };

export interface ShippingProvider {
  readonly name: string;
  /** Serviceability + rate quote for a destination PIN code. */
  quote(toPincode: string, parcel: Parcel): Promise<{ available: boolean; chargePaise?: number; etaDays?: number }>;
  createShipment(orderNumber: string, to: Address, parcel: Parcel): Promise<{ courier: string; trackingNumber: string; labelUrl?: string }>;
  track(trackingNumber: string): Promise<{ delivered: boolean; events: TrackingEvent[] }>;
}

/** Manual provider used today: tracking info is entered by staff. */
export const manualShipping = {
  name: "manual",
  trackingUrl(courier: string | null, trackingNumber: string | null) {
    if (!courier || !trackingNumber) return null;
    const c = courier.toLowerCase();
    if (c.includes("india post") || c.includes("speed post")) return `https://www.indiapost.gov.in/`;
    return null; // add courier-specific tracking URLs here
  },
};

export function getShippingProvider(): ShippingProvider | null {
  // e.g. if (process.env.SHIPROCKET_EMAIL) return new ShiprocketProvider(...)
  return null;
}
