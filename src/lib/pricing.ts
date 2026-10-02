export type PriceTier = { qty: number; pricePer1000: number; discountPct: number };

export function parsePriceTiers(raw: unknown): PriceTier[] {
  if (!Array.isArray(raw)) return [];
  return (raw as PriceTier[]).filter(
    (t) => typeof t.qty === "number" && typeof t.pricePer1000 === "number",
  );
}

/** Find the best (largest qty <= requested) price tier for a quantity. */
export function tierForQuantity(priceTiers: PriceTier[], quantity: number): PriceTier | null {
  const sorted = [...priceTiers].sort((a, b) => a.qty - b.qty);
  let best: PriceTier | null = null;
  for (const t of sorted) {
    if (t.qty <= quantity) best = t;
  }
  return best ?? sorted[0] ?? null;
}

export interface Quote {
  quantity: number;
  pricePer1000: number;
  subtotal: number;
  discountPct: number;
  discountAmount: number;
  total: number;
}

/**
 * Compute a real-time quote: price for the quantity from the matching
 * breakpoint, plus an optional coupon percentage applied on top.
 */
export function quotePrice(
  priceTiers: PriceTier[],
  quantity: number,
  couponPct = 0,
): Quote | null {
  const tier = tierForQuantity(priceTiers, quantity);
  if (!tier) return null;
  const subtotal = Math.round(tier.pricePer1000 * (quantity / 1000) * 100) / 100;
  const discountAmount = Math.round(subtotal * (couponPct / 100) * 100) / 100;
  const total = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
  return {
    quantity,
    pricePer1000: tier.pricePer1000,
    subtotal,
    discountPct: couponPct,
    discountAmount,
    total,
  };
}

export function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

export function formatCompact(n: number): string {
  if (n >= 1000) {
    const v = n / 1000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)}K`;
  }
  return `${n}`;
}

export function shortOrderId(id: string): string {
  return id.slice(-8).toUpperCase();
}
