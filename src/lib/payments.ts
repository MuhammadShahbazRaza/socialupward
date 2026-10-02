import Stripe from "stripe";

/**
 * Stripe integration hooks.
 *
 * - Server: call `getStripe()` / `createCheckoutSession()` when
 *   STRIPE_SECRET_KEY is configured; otherwise the checkout API falls
 *   back to a stubbed "manual" flow so the store works out of the box.
 * - Client: pass NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY through when you
 *   add Stripe Elements / Payment Links.
 */

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith("sk_test_...")) return null;
  if (!stripe) {
    stripe = new Stripe(key, { apiVersion: "2026-09-30.endive" });
  }
  return stripe;
}

export async function createCheckoutSession(params: {
  orderId: string;
  amountCents: number;
  email: string;
  description: string;
}): Promise<{ url: string | null; stub: boolean }> {
  const s = getStripe();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  if (!s) {
    // Stubbed flow: no Stripe keys configured yet.
    return { url: null, stub: true };
  }
  const session = await s.checkout.sessions.create({
    mode: "payment",
    customer_email: params.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: params.description },
          unit_amount: params.amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: { orderId: params.orderId },
    success_url: `${site}/checkout/success?order=${params.orderId}`,
    cancel_url: `${site}/checkout?cancelled=1`,
  });
  return { url: session.url, stub: false };
}

/** Crypto checkout hook — swap in your provider (Coinbase Commerce, NOWPayments…). */
export function createCryptoInvoiceStub(orderId: string, amountUsd: number) {
  return {
    stub: true,
    orderId,
    amountUsd,
    message:
      "Crypto checkout is in stub mode. Connect Coinbase Commerce or NOWPayments and return a hosted invoice URL here.",
  };
}
