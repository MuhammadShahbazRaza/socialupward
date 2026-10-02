import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ reviews });
}
