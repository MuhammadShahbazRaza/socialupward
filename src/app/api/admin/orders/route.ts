import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [orderCount, revenue, pendingCount, tierCount, couponCount] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.packageTier.count({ where: { active: true } }),
    prisma.coupon.count({ where: { active: true } }),
  ]);
  const recent = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { platform: true, packageTier: true },
  });
  return NextResponse.json({
    stats: {
      orders: orderCount,
      revenue: revenue._sum.total ?? 0,
      pending: pendingCount,
      tiers: tierCount,
      coupons: couponCount,
    },
    recent,
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { status } = await req.json();
    const where = status ? { status } : {};
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { platform: true, packageTier: { include: { serviceCategory: true } } },
    });
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Could not list orders" }, { status: 500 });
  }
}
