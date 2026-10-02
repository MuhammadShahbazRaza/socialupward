import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasDatabase } from "@/lib/catalog";
import { findFallbackCoupon } from "@/lib/catalog-fallback";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, error: "Code required" }, { status: 400 });
    }
    const normalized = code.trim().toUpperCase();

    // ── Database first ──────────────────────────────────────────────
    if (hasDatabase()) {
      try {
        const coupon = await prisma.coupon.findUnique({ where: { code: normalized } });
        if (coupon) {
          if (!coupon.active) {
            return NextResponse.json({ valid: false, error: "Invalid or inactive code" });
          }
          if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            return NextResponse.json({ valid: false, error: "This code has expired" });
          }
          if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ valid: false, error: "This code has reached its usage limit" });
          }
          return NextResponse.json({ valid: true, discountPct: coupon.discountPct, code: coupon.code });
        }
        // Not in DB — fall through to static coupons below.
      } catch {
        // DB unreachable — fall through to static coupons.
      }
    }

    // ── Static fallback ─────────────────────────────────────────────
    const fallback = findFallbackCoupon(normalized);
    if (!fallback || !fallback.active) {
      return NextResponse.json({ valid: false, error: "Invalid or inactive code" });
    }
    if (fallback.maxUses !== null && fallback.usedCount >= fallback.maxUses) {
      return NextResponse.json({ valid: false, error: "This code has reached its usage limit" });
    }
    return NextResponse.json({
      valid: true,
      discountPct: fallback.discountPct,
      code: fallback.code,
    });
  } catch {
    return NextResponse.json({ valid: false, error: "Could not validate coupon" }, { status: 500 });
  }
}
