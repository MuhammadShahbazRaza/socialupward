import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, error: "Code required" }, { status: 400 });
    }
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    if (!coupon || !coupon.active) {
      return NextResponse.json({ valid: false, error: "Invalid or inactive code" });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "This code has expired" });
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "This code has reached its usage limit" });
    }
    return NextResponse.json({ valid: true, discountPct: coupon.discountPct, code: coupon.code });
  } catch {
    return NextResponse.json({ valid: false, error: "Could not validate coupon" }, { status: 500 });
  }
}
