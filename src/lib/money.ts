const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Format integer paise as ₹ (drops paise when whole rupees). */
export function formatPaise(paise: number) {
  return paise % 100 === 0 ? inr.format(paise / 100) : inr2.format(paise / 100);
}

export function rupeesToPaise(r: number) {
  return Math.round(r * 100);
}

export function unitLabel(unit: "piece" | "metre", qty = 1) {
  if (unit === "metre") return qty === 1 ? "metre" : "metres";
  return qty === 1 ? "piece" : "pieces";
}

export function formatQty(unit: "piece" | "metre", qty: number) {
  const q = Number.isInteger(qty) ? String(qty) : qty.toFixed(2).replace(/0$/, "");
  return unit === "metre" ? `${q} m` : `${q} ${unitLabel(unit, qty)}`;
}

/** Line total in paise; rounds half-up to the nearest paisa. */
export function lineTotal(unitPricePaise: number, qty: number) {
  return Math.round(unitPricePaise * qty);
}

/** True when qty respects min & step (floating-point safe, 2dp). */
export function isValidQty(qty: number, min: number, step: number, max = 200) {
  if (!Number.isFinite(qty) || qty < min || qty > max) return false;
  const units = Math.round((qty - min) * 100);
  const stepUnits = Math.round(step * 100);
  return stepUnits > 0 && units % stepUnits === 0;
}

export function discountPct(price: number, mrp?: number | null) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
