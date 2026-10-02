import { NextResponse } from "next/server";
import { getPlatforms } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const platforms = await getPlatforms();
  return NextResponse.json({ platforms });
}
