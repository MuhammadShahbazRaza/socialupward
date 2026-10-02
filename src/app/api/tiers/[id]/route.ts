import { NextResponse } from "next/server";
import { getTierById } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tier = await getTierById(id);
  if (!tier) {
    return NextResponse.json({ error: "Tier not found" }, { status: 404 });
  }
  return NextResponse.json({ tier });
}
