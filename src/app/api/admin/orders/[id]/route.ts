import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "REFILL_REQUESTED", "CANCELLED"];
const PAYMENT_STATUSES = ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.status && STATUSES.includes(body.status)) data.status = body.status;
    if (body.paymentStatus && PAYMENT_STATUSES.includes(body.paymentStatus)) {
      data.paymentStatus = body.paymentStatus;
    }
    if (typeof body.notes === "string") data.notes = body.notes;
    const order = await prisma.order.update({ where: { id }, data });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Could not update order" }, { status: 500 });
  }
}
