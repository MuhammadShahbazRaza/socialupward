import type { MetadataRoute } from "next";
import { getPlatforms } from "@/lib/catalog";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://socialupward.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const platforms = await getPlatforms();
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/track-order`, changeFrequency: "monthly", priority: 0.5 },
  ];
  for (const p of platforms) {
    entries.push({
      url: `${SITE}/services/${p.slug}`,
      changeFrequency: "weekly",
      priority: 0.9,
    });
    const full = await import("@/lib/catalog").then((m) =>
      m.getPlatformBySlug(p.slug)
    );
    for (const c of full?.categories ?? []) {
      entries.push({
        url: `${SITE}/services/${p.slug}/${c.slug}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }
  return entries;
}
