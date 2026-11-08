/**
 * PAYMENTS — integration point (disabled in v1: orders are confirmed & paid via WhatsApp/UPI/in-store).
 *
 * To enable Razorpay later:
 *  1. Create a Razorpay account (KYC needed; Razorpay charges a per-transaction fee — no monthly fee on the standard plan).
 *  2. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET.
 *  3. Implement RazorpayProvider below (create order → Checkout.js on the client → verify signature on the server).
 *  4. Add a webhook route at /api/webhooks/razorpay that calls provider.verifyWebhook() and marks
 *     orders.paymentStatus = "paid", paymentProvider = "razorpay", paymentRef = payment id.
 * The orders table already has paymentStatus / paymentProvider / paymentRef columns.
 */

export type CreatePaymentInput = { orderId: string; orderNumber: string; amountPaise: number; customer: { name: string; phone: string; email?: string | null } };
export type CreatePaymentResult = { provider: string; providerOrderId: string; amountPaise: number; currency: "INR"; publicKey: string };

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  /** Verify the client-side checkout signature. */
  verifyPayment(params: { providerOrderId: string; paymentId: string; signature: string }): Promise<boolean>;
  /** Verify a server-to-server webhook (raw body + signature header). */
  verifyWebhook(rawBody: string, signature: string): Promise<boolean>;
}

export class NotConfiguredError extends Error {
  constructor(what: string) {
    super(`${what} is not configured yet. See src/lib/integrations/ for setup steps.`);
  }
}

class RazorpayProvider implements PaymentProvider {
  readonly name = "razorpay";
  async createPayment(): Promise<CreatePaymentResult> {
    // POST https://api.razorpay.com/v1/orders  { amount, currency: "INR", receipt: orderNumber }
    // with Basic auth KEY_ID:KEY_SECRET — then return its id + public key id.
    throw new NotConfiguredError("Razorpay");
  }
  async verifyPayment(): Promise<boolean> {
    // HMAC-SHA256(providerOrderId + "|" + paymentId, KEY_SECRET) === signature (timing-safe compare)
    throw new NotConfiguredError("Razorpay");
  }
  async verifyWebhook(): Promise<boolean> {
    // HMAC-SHA256(rawBody, WEBHOOK_SECRET) === x-razorpay-signature (timing-safe compare)
    throw new NotConfiguredError("Razorpay");
  }
}

export function paymentsEnabled() {
  return process.env.PAYMENTS_ENABLED === "true" && !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;
}

export function getPaymentProvider(): PaymentProvider | null {
  return paymentsEnabled() ? new RazorpayProvider() : null;
}
