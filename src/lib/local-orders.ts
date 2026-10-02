/**
 * local-orders.ts — client-side order persistence (localStorage).
 *
 * Every completed checkout is cached here so order tracking keeps
 * working even when the server-side store is unavailable (no database,
 * or a serverless instance without the in-memory order). Safe to call
 * in the browser only.
 */

export interface LocalOrder {
  id: string;
  email: string;
  usernameOrUrl: string;
  quantity: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  couponCode: string | null;
  status: string;
  paymentStatus: string;
  createdAt: string;
  platform: { name: string };
  packageTier: {
    tierName: string;
    unitLabel: string;
    serviceCategory: { name: string };
  };
}

const STORAGE_KEY = "su_orders";
const MAX_ORDERS = 50;

const ORDER_ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeLocalOrderId(): string {
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += ORDER_ID_CHARS[Math.floor(Math.random() * ORDER_ID_CHARS.length)];
  }
  return `SU-${s}`;
}

function readAll(): LocalOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Cache an order locally (newest first, capped). */
export function saveLocalOrder(order: LocalOrder): void {
  try {
    const existing = readAll().filter((o) => o.id !== order.id);
    existing.unshift(order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, MAX_ORDERS)));
  } catch {
    // Storage full or unavailable — tracking via API still works.
  }
}

/** Find a locally cached order by ID + email (case-insensitive). */
export function findLocalOrder(id: string, email: string): LocalOrder | null {
  const needle = id.trim().toUpperCase();
  const mail = email.trim().toLowerCase();
  return (
    readAll().find(
      (o) => o.id.toUpperCase() === needle && o.email.toLowerCase() === mail,
    ) ?? null
  );
}
