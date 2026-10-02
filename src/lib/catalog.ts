import { prisma } from "./prisma";
import type { Platform, ServiceCategory, PackageTier } from "@prisma/client";

export type PlatformWithCategories = Platform & {
  categories: (ServiceCategory & { tiers: PackageTier[] })[];
};

/** Safe fetch — returns [] instead of throwing when the DB isn't reachable. */
export async function getPlatforms(): Promise<Platform[]> {
  try {
    return await prisma.platform.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

export async function getPlatformBySlug(slug: string): Promise<PlatformWithCategories | null> {
  try {
    return await prisma.platform.findUnique({
      where: { slug },
      include: {
        categories: {
          orderBy: { order: "asc" },
          include: { tiers: { where: { active: true }, orderBy: { tierName: "asc" } } },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getCategory(
  platformSlug: string,
  categorySlug: string,
): Promise<(ServiceCategory & { platform: Platform; tiers: PackageTier[] }) | null> {
  try {
    const platform = await prisma.platform.findUnique({ where: { slug: platformSlug } });
    if (!platform) return null;
    return await prisma.serviceCategory.findFirst({
      where: { platformId: platform.id, slug: categorySlug },
      include: {
        platform: true,
        tiers: { where: { active: true }, orderBy: { tierName: "asc" } },
      },
    });
  } catch {
    return null;
  }
}

export async function getTierById(id: string) {
  try {
    return await prisma.packageTier.findUnique({
      where: { id },
      include: { serviceCategory: { include: { platform: true } } },
    });
  } catch {
    return null;
  }
}

export async function getReviews(limit = 12) {
  try {
    return await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}
