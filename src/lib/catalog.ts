import { prisma } from "./prisma";
import type { Platform, ServiceCategory, PackageTier } from "@prisma/client";
import {
  FALLBACK_PLATFORMS,
  FALLBACK_REVIEWS,
  getFallbackPlatformBySlug,
  getFallbackCategory,
  getFallbackTierById,
} from "./catalog-fallback";

export type PlatformWithCategories = Platform & {
  categories: (ServiceCategory & { tiers: PackageTier[] })[];
};

/** True when a database connection string is configured. */
export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}

/** Safe fetch — database first, static fallback when the DB is missing/unreachable. */
export async function getPlatforms(): Promise<Platform[]> {
  if (!hasDatabase()) return FALLBACK_PLATFORMS;
  try {
    return await prisma.platform.findMany({ orderBy: { order: "asc" } });
  } catch {
    return FALLBACK_PLATFORMS;
  }
}

export async function getPlatformBySlug(slug: string): Promise<PlatformWithCategories | null> {
  if (!hasDatabase()) return getFallbackPlatformBySlug(slug);
  try {
    const platform = await prisma.platform.findUnique({
      where: { slug },
      include: {
        categories: {
          orderBy: { order: "asc" },
          include: { tiers: { where: { active: true }, orderBy: { tierName: "asc" } } },
        },
      },
    });
    if (platform) return platform;
  } catch {
    // fall through to static data
  }
  return getFallbackPlatformBySlug(slug);
}

export async function getCategory(
  platformSlug: string,
  categorySlug: string,
): Promise<(ServiceCategory & { platform: Platform; tiers: PackageTier[] }) | null> {
  if (!hasDatabase()) return getFallbackCategory(platformSlug, categorySlug);
  try {
    const platform = await prisma.platform.findUnique({ where: { slug: platformSlug } });
    if (platform) {
      const category = await prisma.serviceCategory.findFirst({
        where: { platformId: platform.id, slug: categorySlug },
        include: {
          platform: true,
          tiers: { where: { active: true }, orderBy: { tierName: "asc" } },
        },
      });
      if (category) return category;
    }
  } catch {
    // fall through to static data
  }
  return getFallbackCategory(platformSlug, categorySlug);
}

export async function getTierById(id: string) {
  if (!hasDatabase()) return getFallbackTierById(id);
  try {
    const tier = await prisma.packageTier.findUnique({
      where: { id },
      include: { serviceCategory: { include: { platform: true } } },
    });
    if (tier) return tier;
  } catch {
    // fall through to static data
  }
  return getFallbackTierById(id);
}

export async function getReviews(limit = 12) {
  if (!hasDatabase()) return FALLBACK_REVIEWS.slice(0, limit);
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    if (reviews.length > 0) return reviews;
  } catch {
    // fall through to static data
  }
  return FALLBACK_REVIEWS.slice(0, limit);
}
