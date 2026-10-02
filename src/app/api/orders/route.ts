import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTierById, hasDatabase } from "@/lib/catalog";
import {
  findFallbackCoupon,
  incrementFallbackCouponUsage,
  fallbackOrderStore,
  makeFallbackOrderId,
  type FallbackOrder,
} from "@/lib/catalog-fallback";
import { parsePriceTiers, quotePrice, shortOrderId } from "@/lib/pricing";
import { createCheckoutSession, createCryptoInvoiceStub } from "@/lib/payments";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Provider = "stripe" | "card" | "crypto";

/** Resolve a usable coupon percentage: database first, static fallback second. */
async function resolveCouponPct(
  rawCode: unknown,
): Promise<{ pct: number; code: string | null; fallback: boolean }> {
  if (!rawCode || typeof rawCode !== "string" || !rawCode.trim()) {
    return { pct: 0, code: null, fallback: false };
  }
  const code = rawCode.trim().toUpperCase();

  if (hasDatabase()) {
    try {
      const found = await prisma.coupon.findUnique({ where: { code } });
      const usable =
        found &&
        found.active &&
        (!found.expiresAt || found.expiresAt > new Date()) &&
        (found.maxUses === null || found.usedCount < found.maxUses);
      if (usable) {
        await prisma.coupon.update({
          where: { code: found.code },
          data: { usedCount: { increment: 1 } },
        });
        return { pct: found.discountPct, code: found.code, fallback: false };
      }
      if (found) return { pct: 0, code: null, fallback: false }; // exists but unusable
    } catch {
      // DB unreachable — try static coupons below.
    }
  }

  const fb = findFallbackCoupon(code);
  const usable =
    fb && fb.active && (fb.maxUses === null || fb.usedCount < fb.maxUses);
  if (usable) {
    incrementFallbackCouponUsage(code);
    return { pct: fb.discountPct, code: fb.code, fallback: true };
  }
  return { pct: 0, code: null, fallback: false };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tierId, quantity, email, usernameOrUrl, couponCode, paymentProvider } = body;

    // ── Validation ────────────────────────────────────────────────
    if (!tierId || typeof tierId !== "string") {
      return NextResponse.json({ error: "Package tier is required" }, { status: 400 });
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }
    if (!usernameOrUrl || String(usernameOrUrl).trim().length < 2) {
      return NextResponse.json({ error: "Your public username or post URL is required" }, { status: 400 });
    }
    const provider: Provider = ["stripe", "card", "crypto"].includes(paymentProvider)
      ? paymentProvider
      : "stripe";

    const tier = await getTierById(tierId);
    if (!tier || !tier.active) {
      return NextResponse.json({ error: "This package is no longer available" }, { status: 400 });
    }
    if (qty < tier.minQuantity || qty > tier.maxQuantity) {
      return NextResponse.json(
        { error: `Quantity must be between ${tier.minQuantity} and ${tier.maxQuantity}` },
        { status: 400 },
      );
    }

    // ── Server-side pricing (never trust the client) ──────────────
    const coupon = await resolveCouponPct(couponCode);
    const quote = quotePrice(parsePriceTiers(tier.priceTiers), qty, coupon.pct);
    if (!quote) {
      return NextResponse.json({ error: "Could not price this package" }, { status: 500 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const handle = String(usernameOrUrl).trim();
    const platformId = tier.serviceCategory.platformId;
    const platformName = tier.serviceCategory.platform.name;
    const description = `SocialUpward: ${qty.toLocaleString()} ${tier.unitLabel} (${tier.tierName}) — ${platformName}`;

    // ── Persist: database first, in-memory store when unavailable ──
    let orderId: string;
    let orderNumber: string;

    if (hasDatabase()) {
      try {
        const order = await prisma.order.create({
          data: {
            email: normalizedEmail,
            usernameOrUrl: handle,
            platformId,
            packageTierId: tier.id,
            quantity: qty,
            unitPrice: quote.pricePer1000,
            subtotal: quote.subtotal,
            discountAmount: quote.discountAmount,
            total: quote.total,
            couponCode: coupon.code,
            paymentProvider: provider,
            paymentStatus: "PENDING",
            status: "PENDING",
          },
        });
        orderId = order.id;
        orderNumber = shortOrderId(order.id);
      } catch {
        orderId = persistFallbackOrder();
        orderNumber = orderId;
      }
    } else {
      orderId = persistFallbackOrder();
      orderNumber = orderId;
    }

    function persistFallbackOrder(): string {
      const id = makeFallbackOrderId();
      const record: FallbackOrder = {
        id,
        email: normalizedEmail,
        usernameOrUrl: handle,
        platformId,
        packageTierId: tier!.id,
        quantity: qty,
        unitPrice: quote!.pricePer1000,
        subtotal: quote!.subtotal,
        discountAmount: quote!.discountAmount,
        total: quote!.total,
        couponCode: coupon.code,
        status: "PENDING",
        paymentProvider: provider,
        paymentStatus: "PENDING",
        createdAt: new Date().toISOString(),
        platform: { name: platformName },
        packageTier: {
          tierName: tier!.tierName,
          unitLabel: tier!.unitLabel,
          serviceCategory: { name: tier!.serviceCategory.name },
        },
      };
      fallbackOrderStore.set(id, record);
      return id;
    }

    // ── Payment hook ──────────────────────────────────────────────
    let payment: { url: string | null; stub: boolean; crypto?: unknown } = { url: null, stub: true };

    if (provider === "crypto") {
      payment = { ...payment, crypto: createCryptoInvoiceStub(orderId, quote.total) };
    } else {
      payment = await createCheckoutSession({
        orderId,
        amountCents: Math.round(quote.total * 100),
        email: normalizedEmail,
        description,
      });
    }

    return NextResponse.json({
      orderId,
      orderNumber,
      total: quote.total,
      payment,
    });
  } catch (err) {
    console.error("Order creation failed:", err);
    return NextResponse.json({ error: "Could not create order. Please try again." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const email = req.nextUrl.searchParams.get("email");
  if (!id || !email) {
    return NextResponse.json({ error: "Order ID and email are required" }, { status: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const lookupId = id.trim();

  // ── Database first ──────────────────────────────────────────────
  if (hasDatabase()) {
    try {
      const order = await prisma.order.findFirst({
        where: { id: lookupId, email: normalizedEmail },
        include: {
          platform: true,
          packageTier: { include: { serviceCategory: true } },
        },
      });
      if (order) return NextResponse.json({ order });
    } catch {
      // DB unreachable — check the in-memory store below.
    }
  }

  // ── In-memory fallback store ────────────────────────────────────
  const mem =
    fallbackOrderStore.get(lookupId) ??
    fallbackOrderStore.get(lookupId.toUpperCase());
  if (mem && mem.email === normalizedEmail) {
    return NextResponse.json({ order: mem });
  }
  return NextResponse.json({ error: "No order found with that ID and email" }, { status: 404 });
}
