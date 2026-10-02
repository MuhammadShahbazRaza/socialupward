import { NextRequest, NextResponse } from "next/server";
import { getPlatformBySlug } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const platformSlug = req.nextUrl.searchParams.get("platform");
  if (!platformSlug) {
    return NextResponse.json({ error: "platform query param required" }, { status: 400 });
  }
  const platform = await getPlatformBySlug(platformSlug);
  if (!platform) {
    return NextResponse.json({ error: "Platform not found" }, { status: 404 });
  }
  return NextResponse.json({ platform, categories: platform.categories });
}
