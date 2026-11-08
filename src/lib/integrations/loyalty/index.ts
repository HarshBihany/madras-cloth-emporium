/**
 * LOYALTY POINTS — integration point.
 *
 * Tables ready: customers (loyaltyBalance) + loyalty_ledger (append-only), orders.loyaltyPointsEarned.
 * When customer accounts launch (Supabase Auth → customers.authUserId), call awardForOrder()
 * when an order reaches "delivered"/"completed", and redeem() at checkout.
 * Rules are configuration — change them here without touching order logic.
 */

export const LOYALTY_RULES = {
  enabled: process.env.LOYALTY_ENABLED === "true",
  pointsPerRupee: 1 / 100, // 1 point per ₹100 spent
  rupeeValuePerPoint: 1, // 1 point = ₹1 off
  minRedeemPoints: 100,
  maxRedeemPctOfOrder: 10,
  excludeDemoItems: true,
};

export function pointsForOrder(eligibleTotalPaise: number) {
  if (!LOYALTY_RULES.enabled) return 0;
  return Math.floor((eligibleTotalPaise / 100) * LOYALTY_RULES.pointsPerRupee);
}

export function maxRedeemablePoints(balance: number, orderTotalPaise: number) {
  if (!LOYALTY_RULES.enabled || balance < LOYALTY_RULES.minRedeemPoints) return 0;
  const capRupees = Math.floor((orderTotalPaise / 100) * (LOYALTY_RULES.maxRedeemPctOfOrder / 100));
  return Math.min(balance, Math.floor(capRupees / LOYALTY_RULES.rupeeValuePerPoint));
}

export interface LoyaltyService {
  awardForOrder(orderId: string): Promise<number>;
  redeem(customerId: string, points: number, orderId: string): Promise<void>;
  balance(customerId: string): Promise<number>;
}
