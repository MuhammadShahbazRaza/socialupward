import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { code, discountPct, maxUses, expiresAt } = await req.json();
    if (!code || typeof discountPct !== "number") {
      return NextResponse.json({ error: "Code and discount % are required" }, { status: 400 });
    }
    const coupon = await prisma.coupon.create({
      data: {
        code: String(code).trim().toUpperCase(),
        discountPct,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    return NextResponse.json({ coupon });
  } catch {
    return NextResponse.json({ error: "Could not create coupon (code may already exist)" }, { status: 400 });
  }
}
