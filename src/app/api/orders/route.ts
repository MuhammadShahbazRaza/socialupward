import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTierById } from "@/lib/catalog";
import { parsePriceTiers, quotePrice, shortOrderId } from "@/lib/pricing";
import { createCheckoutSession, createCryptoInvoiceStub } from "@/lib/payments";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const provider = ["stripe", "card", "crypto"].includes(paymentProvider) ? paymentProvider : "stripe";

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
    let couponPct = 0;
    let coupon: { code: string } | null = null;
    if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
      const found = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });
      const usable =
        found &&
        found.active &&
        (!found.expiresAt || found.expiresAt > new Date()) &&
        (found.maxUses === null || found.usedCount < found.maxUses);
      if (usable) {
        couponPct = found.discountPct;
        coupon = { code: found.code };
      }
    }

    const quote = quotePrice(parsePriceTiers(tier.priceTiers), qty, couponPct);
    if (!quote) {
      return NextResponse.json({ error: "Could not price this package" }, { status: 500 });
    }

    // ── Create order ──────────────────────────────────────────────
    const order = await prisma.order.create({
      data: {
        email: email.trim().toLowerCase(),
        usernameOrUrl: String(usernameOrUrl).trim(),
        platformId: tier.serviceCategory.platformId,
        packageTierId: tier.id,
        quantity: qty,
        unitPrice: quote.pricePer1000,
        subtotal: quote.subtotal,
        discountAmount: quote.discountAmount,
        total: quote.total,
        couponCode: coupon?.code ?? null,
        paymentProvider: provider,
        paymentStatus: "PENDING",
        status: "PENDING",
      },
    });

    if (coupon) {
      await prisma.coupon.update({
        where: { code: coupon.code },
        data: { usedCount: { increment: 1 } },
      });
    }

    // ── Payment hook ──────────────────────────────────────────────
    const description = `SocialUpward: ${qty.toLocaleString()} ${tier.unitLabel} (${tier.tierName}) — ${tier.serviceCategory.platform.name}`;
    let payment: { url: string | null; stub: boolean; crypto?: unknown } = { url: null, stub: true };

    if (provider === "crypto") {
      payment = { ...payment, crypto: createCryptoInvoiceStub(order.id, quote.total) };
    } else {
      payment = await createCheckoutSession({
        orderId: order.id,
        amountCents: Math.round(quote.total * 100),
        email: order.email,
        description,
      });
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: shortOrderId(order.id),
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
  try {
    const order = await prisma.order.findFirst({
      where: { id, email: email.trim().toLowerCase() },
      include: {
        platform: true,
        packageTier: { include: { serviceCategory: true } },
      },
    });
    if (!order) {
      return NextResponse.json({ error: "No order found with that ID and email" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Could not look up order" }, { status: 500 });
  }
}
