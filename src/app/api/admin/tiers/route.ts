import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tiers = await prisma.packageTier.findMany({
    orderBy: { createdAt: "desc" },
    include: { serviceCategory: { include: { platform: true } } },
  });
  return NextResponse.json({ tiers });
}
