import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.basePricePer1000 === "number") data.basePricePer1000 = body.basePricePer1000;
    if (Array.isArray(body.priceTiers)) data.priceTiers = body.priceTiers;
    if (typeof body.active === "boolean") data.active = body.active;
    if (Array.isArray(body.features)) data.features = body.features;
    if (typeof body.deliveryEstimate === "string") data.deliveryEstimate = body.deliveryEstimate;
    if (typeof body.guaranteeDays === "number") data.guaranteeDays = body.guaranteeDays;
    if (typeof body.minQuantity === "number") data.minQuantity = body.minQuantity;
    if (typeof body.maxQuantity === "number") data.maxQuantity = body.maxQuantity;
    const tier = await prisma.packageTier.update({ where: { id }, data });
    return NextResponse.json({ tier });
  } catch {
    return NextResponse.json({ error: "Could not update tier" }, { status: 500 });
  }
}
