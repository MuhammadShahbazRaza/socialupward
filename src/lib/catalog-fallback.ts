/**
 * catalog-fallback.ts
 *
 * Static, zero-database catalog that mirrors prisma/seed.ts exactly.
 * Used as a drop-in fallback whenever DATABASE_URL is missing or the
 * database is unreachable: the API routes try the database first and
 * fall back to these records, so the whole storefront flow works
 * out of the box. Once a real DATABASE_URL is configured, the DB
 * takes precedence automatically.
 */
import type {
  Platform,
  ServiceCategory,
  PackageTier,
  Review,
  Coupon,
} from "@prisma/client";

const FALLBACK_DATE = new Date("2026-01-15T00:00:00.000Z");

export type PriceLadderTier = {
  qty: number;
  pricePer1000: number;
  discountPct: number;
};

const QUANTITIES = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000];
const DISCOUNT_BY_QTY: Record<number, number> = {
  100: 0,
  500: 5,
  1000: 10,
  5000: 18,
  10000: 25,
  25000: 32,
  50000: 38,
  100000: 45,
};

/** Descending per-1K price ladder — identical math to prisma/seed.ts. */
export function fallbackLadder(basePer1000: number): PriceLadderTier[] {
  return QUANTITIES.map((qty) => {
    const discountPct = DISCOUNT_BY_QTY[qty];
    const pricePer1000 =
      Math.round(basePer1000 * (1 - discountPct / 100) * 100) / 100;
    return { qty, pricePer1000, discountPct };
  });
}

type TierDef = {
  tierName: "Standard" | "Premium/VIP";
  unitLabel: string;
  basePricePer1000: number;
  features: string[];
  deliveryEstimate: string;
  guaranteeDays: number;
};

type CategoryDef = {
  name: string;
  slug: string;
  description: string;
  tiers: TierDef[];
};

type PlatformDef = {
  name: string;
  slug: string;
  icon: string;
  gradient: string;
  description: string;
  categories: CategoryDef[];
};

const std = (
  unitLabel: string,
  basePricePer1000: number,
  features: string[],
  deliveryEstimate = "1–24 hours",
): TierDef => ({
  tierName: "Standard",
  unitLabel,
  basePricePer1000,
  features,
  deliveryEstimate,
  guaranteeDays: 30,
});

const pro = (
  unitLabel: string,
  basePricePer1000: number,
  features: string[],
  deliveryEstimate = "1–12 hours",
): TierDef => ({
  tierName: "Premium/VIP",
  unitLabel,
  basePricePer1000,
  features,
  deliveryEstimate,
  guaranteeDays: 60,
});

const PLATFORM_DEFS: PlatformDef[] = [
  {
    name: "Instagram",
    slug: "instagram",
    icon: "instagram",
    gradient: "from-fuchsia-500 via-pink-500 to-amber-400",
    description:
      "Grow your Instagram with real-looking followers, high-retention likes, views and targeted engagement that actually moves the algorithm.",
    categories: [
      {
        name: "Audience Growth Tiers",
        slug: "followers",
        description:
          "Build social proof fast. Choose high-value followers or active, targeted Premium followers matched to your niche.",
        tiers: [
          std("followers", 12.99, [
            "High-quality profiles with avatars",
            "Gradual natural delivery",
            "No password required",
            "30-day refill guarantee",
          ]),
          pro("followers", 24.99, [
            "Active, targeted real-looking accounts",
            "Niche & interest targeting available",
            "Priority express delivery",
            "60-day refill guarantee",
            "Dedicated account manager",
          ]),
        ],
      },
      {
        name: "Engagement Boosts",
        slug: "likes",
        description:
          "Likes, comments and saves that push your posts onto Explore. Instant start, drip-fed for a natural curve.",
        tiers: [
          std("likes", 4.99, [
            "High-retention likes",
            "Instant start (0–1 hour)",
            "Drip-feed available",
            "No password required",
          ]),
          pro("likes", 9.99, [
            "Likes from active accounts",
            "Comments & saves bundles",
            "Custom comment text",
            "60-day refill guarantee",
          ]),
        ],
      },
      {
        name: "Content Reach Packages",
        slug: "views",
        description:
          "Reels views, story views and video views engineered to trigger Instagram's recommendation engine.",
        tiers: [
          std("views", 2.49, [
            "High-retention reels views",
            "Start within 1 hour",
            "Works on reels, stories & videos",
            "30-day refill guarantee",
          ]),
          pro("views", 4.99, [
            "Premium high-retention views",
            "Geo-targeting available",
            "Boosts Explore placement",
            "60-day refill guarantee",
          ]),
        ],
      },
    ],
  },
  {
    name: "TikTok",
    slug: "tiktok",
    icon: "music-2",
    gradient: "from-cyan-400 via-sky-500 to-indigo-600",
    description:
      "Hit the For You Page with followers, likes and views tuned for TikTok's velocity-driven algorithm.",
    categories: [
      {
        name: "Audience Growth Tiers",
        slug: "followers",
        description:
          "Followers that grow your authority and unlock TikTok Shop, LIVE gifting and the Creator Rewards Program faster.",
        tiers: [
          std("followers", 14.99, [
            "High-quality TikTok profiles",
            "Natural gradual delivery",
            "No password required",
            "30-day refill guarantee",
          ]),
          pro("followers", 27.99, [
            "Active real-looking accounts",
            "Interest-based targeting",
            "Express delivery",
            "60-day refill guarantee",
          ]),
        ],
      },
      {
        name: "Engagement Boosts",
        slug: "likes",
        description:
          "Likes, shares and comments that spike your video velocity in the first critical hours after posting.",
        tiers: [
          std("likes", 5.99, [
            "Instant start likes",
            "Drip-feed for natural growth",
            "Shares & saves available",
            "No password required",
          ]),
          pro("likes", 11.99, [
            "Premium engagement velocity",
            "Custom comments",
            "Viral-push delivery curve",
            "60-day refill guarantee",
          ]),
        ],
      },
      {
        name: "Content Reach Packages",
        slug: "views",
        description:
          "Massive view counts with completion-rate-friendly delivery to keep your watch time metrics healthy.",
        tiers: [
          std("views", 2.99, [
            "Fast-start video views",
            "FYP-optimized pacing",
            "Live stream views available",
            "30-day refill guarantee",
          ]),
          pro("views", 5.49, [
            "Premium high-retention views",
            "Geo & interest targeting",
            "Viral campaign pacing",
            "60-day refill guarantee",
          ]),
        ],
      },
      {
        name: "Live Viewership Packages",
        slug: "live-views",
        description:
          "Keep your TikTok LIVE room buzzing — concurrent viewers that attract real organic joiners.",
        tiers: [
          std("live-viewers", 19.99, [
            "Stable concurrent viewers",
            "30–120 min sessions",
            "Start within 15 minutes",
            "No password required",
          ]),
          pro("live-viewers", 34.99, [
            "High-stability viewers",
            "Up to 8-hour sessions",
            "Chat engagement add-ons",
            "Priority support line",
          ]),
        ],
      },
    ],
  },
  {
    name: "YouTube",
    slug: "youtube",
    icon: "youtube",
    gradient: "from-red-500 via-rose-500 to-orange-400",
    description:
      "Subscribers, watch hours and views that help you hit monetization thresholds and rank in search & suggested.",
    categories: [
      {
        name: "Audience Growth Tiers",
        slug: "subscribers",
        description:
          "Channel subscribers that build credibility and move you toward the 1,000-subscriber monetization milestone.",
        tiers: [
          std("subscribers", 39.99, [
            "High-quality subscriber profiles",
            "Gradual safe delivery",
            "No password required",
            "30-day refill guarantee",
          ]),
          pro("subscribers", 69.99, [
            "Active real-looking subscribers",
            "Niche-targeted delivery",
            "Monetization-safe pacing",
            "60-day refill guarantee",
          ]),
        ],
      },
      {
        name: "Content Reach Packages",
        slug: "views",
        description:
          "Views with real watch time that feed the algorithm and push you into suggested video feeds.",
        tiers: [
          std("views", 7.99, [
            "High-retention views",
            "Real watch-time delivery",
            "Search & suggested boost",
            "30-day refill guarantee",
          ]),
          pro("views", 13.99, [
            "Premium retention (60%+)",
            "Geo-targeted views",
            "Watch-hour friendly",
            "60-day refill guarantee",
          ]),
        ],
      },
      {
        name: "Engagement Boosts",
        slug: "likes",
        description:
          "Likes and comments that strengthen your video's ranking signals and social proof on the watch page.",
        tiers: [
          std("likes", 6.99, [
            "High-retention likes",
            "Drip-feed delivery",
            "No password required",
            "30-day refill guarantee",
          ]),
          pro("likes", 12.99, [
            "Likes + custom comments",
            "Community-tab friendly",
            "60-day refill guarantee",
          ]),
        ],
      },
      {
        name: "Live Viewership Packages",
        slug: "live-views",
        description:
          "Concurrent viewers for premieres and live streams that lift you in YouTube's live discovery shelf.",
        tiers: [
          std("live-viewers", 24.99, [
            "Stable concurrent viewers",
            "Premiere-ready delivery",
            "Start within 15 minutes",
            "No password required",
          ]),
          pro("live-viewers", 44.99, [
            "Ultra-stable viewers",
            "Up to 12-hour sessions",
            "Live chat engagement",
            "Priority support line",
          ]),
        ],
      },
    ],
  },
  {
    name: "X (Twitter)",
    slug: "x-twitter",
    icon: "twitter",
    gradient: "from-slate-200 via-slate-400 to-slate-600",
    description:
      "Followers, reposts and impressions that amplify your voice and get your posts trending.",
    categories: [
      {
        name: "Audience Growth Tiers",
        slug: "followers",
        description: "Build authority with followers that make your profile impossible to ignore.",
        tiers: [
          std("followers", 11.99, [
            "High-quality profiles",
            "Gradual delivery",
            "No password required",
            "30-day refill guarantee",
          ]),
          pro("followers", 22.99, [
            "Active targeted accounts",
            "Interest-based targeting",
            "Express delivery",
            "60-day refill guarantee",
          ]),
        ],
      },
      {
        name: "Engagement Boosts",
        slug: "likes",
        description: "Likes, reposts and replies that push your posts into timelines and trends.",
        tiers: [
          std("likes", 5.49, [
            "Instant-start engagement",
            "Reposts & replies available",
            "No password required",
          ]),
          pro("likes", 10.49, [
            "Premium engagement mix",
            "Custom replies",
            "Trend-push pacing",
          ]),
        ],
      },
    ],
  },
  {
    name: "Facebook",
    slug: "facebook",
    icon: "facebook",
    gradient: "from-blue-500 via-indigo-500 to-violet-600",
    description:
      "Page likes, followers and post engagement for brands, local businesses and community pages.",
    categories: [
      {
        name: "Audience Growth Tiers",
        slug: "followers",
        description: "Page followers and profile followers that build trust with every visitor.",
        tiers: [
          std("followers", 9.99, [
            "High-quality page followers",
            "Gradual delivery",
            "No password required",
            "30-day refill guarantee",
          ]),
          pro("followers", 18.99, [
            "Targeted real-looking followers",
            "Geo-targeting available",
            "Express delivery",
            "60-day refill guarantee",
          ]),
        ],
      },
      {
        name: "Engagement Boosts",
        slug: "likes",
        description: "Post likes, reactions, comments and shares that boost your EdgeRank visibility.",
        tiers: [
          std("likes", 4.49, [
            "Reactions & likes",
            "Shares available",
            "No password required",
          ]),
          pro("likes", 8.99, [
            "Custom comments",
            "Share bundles",
            "Viral pacing",
          ]),
        ],
      },
    ],
  },
  {
    name: "Twitch",
    slug: "twitch",
    icon: "twitch",
    gradient: "from-violet-500 via-purple-600 to-indigo-700",
    description:
      "Viewers and followers that help you climb categories, hit Affiliate & Partner, and fill your chat.",
    categories: [
      {
        name: "Live Viewership Packages",
        slug: "live-views",
        description:
          "Concurrent viewers that lift your stream's ranking in its category and pull in organic raiders.",
        tiers: [
          std("live-viewers", 17.99, [
            "Stable concurrent viewers",
            "Start within 15 minutes",
            "Up to 6-hour sessions",
            "No password required",
          ]),
          pro("live-viewers", 32.99, [
            "Ultra-stable viewers",
            "Up to 24-hour sessions",
            "Chat bots & engagement",
            "Priority support line",
          ]),
        ],
      },
      {
        name: "Audience Growth Tiers",
        slug: "followers",
        description: "Channel followers that grow your community and Affiliate/Partner eligibility.",
        tiers: [
          std("followers", 10.99, [
            "High-quality followers",
            "Gradual delivery",
            "No password required",
            "30-day refill guarantee",
          ]),
          pro("followers", 19.99, [
            "Active real-looking followers",
            "Express delivery",
            "60-day refill guarantee",
          ]),
        ],
      },
    ],
  },
  {
    name: "Spotify",
    slug: "spotify",
    icon: "disc-3",
    gradient: "from-emerald-400 via-green-500 to-teal-600",
    description:
      "Streams, monthly listeners and playlist placements that feed the Spotify algorithm and editorial radar.",
    categories: [
      {
        name: "Content Reach Packages",
        slug: "streams",
        description:
          "Track streams with royalty-eligible style delivery patterns that respect Spotify's fraud filters.",
        tiers: [
          std("streams", 6.99, [
            "High-retention streams",
            "Natural delivery pacing",
            "No password required",
            "30-day refill guarantee",
          ]),
          pro("streams", 12.49, [
            "Premium listener quality",
            "Geo-targeted streams",
            "Algorithmic playlist push",
            "60-day refill guarantee",
          ]),
        ],
      },
      {
        name: "Audience Growth Tiers",
        slug: "followers",
        description: "Monthly listeners and profile followers that make your artist page look established.",
        tiers: [
          std("monthly-listeners", 8.99, [
            "Monthly listeners",
            "Natural pacing",
            "No password required",
          ]),
          pro("monthly-listeners", 15.99, [
            "Premium listeners",
            "Follower bundles",
            "Playlist consideration",
          ]),
        ],
      },
    ],
  },
];

const REVIEW_DEFS: Array<{
  name: string;
  rating: number;
  text: string;
  platformName: string;
}> = [
  {
    name: "Marcus T.",
    rating: 5,
    text: "Ordered 10k Instagram followers on the Premium tier and they started arriving within an hour. Zero drops after 3 weeks. This is the most reliable panel I've used.",
    platformName: "Instagram",
  },
  {
    name: "Sofia R.",
    rating: 5,
    text: "My TikTok went from 2k to 50k followers in a month using their growth tiers plus my own content. The drip-feed delivery looks completely natural.",
    platformName: "TikTok",
  },
  {
    name: "Dre W.",
    rating: 5,
    text: "Hit YouTube monetization with their subscriber + views combo. Support answered at 3am when I had a question about my order. Unreal service.",
    platformName: "YouTube",
  },
  {
    name: "Aisha K.",
    rating: 5,
    text: "I was skeptical about buying engagement but the Premium comments are actually relevant to my niche. My reels reach tripled in two weeks.",
    platformName: "Instagram",
  },
  {
    name: "Leo M.",
    rating: 4,
    text: "Twitch viewers are stable and my average CCV went from 8 to 60. Took about 20 minutes to start. Wish the dashboard had live viewer counts but support was great.",
    platformName: "Twitch",
  },
  {
    name: "Nina P.",
    rating: 5,
    text: "The 30-day refill guarantee is real — a few followers dropped after a month and they refilled within a day, no questions asked. Customer for life.",
    platformName: "Instagram",
  },
  {
    name: "Carlos D.",
    rating: 5,
    text: "Ran a Spotify pre-save campaign with their streams package. Landed on two algorithmic playlists. The pacing felt organic, no red flags.",
    platformName: "Spotify",
  },
  {
    name: "Priya S.",
    rating: 5,
    text: "Checkout took literally 2 minutes, no account needed, and my X post hit 40k impressions. The order tracker is a nice touch — I could see every stage.",
    platformName: "X (Twitter)",
  },
];

const COUPON_DEFS: Array<{ code: string; discountPct: number; maxUses: number }> = [
  { code: "WELCOME10", discountPct: 10, maxUses: 1000 },
  { code: "GROW20", discountPct: 20, maxUses: 200 },
  { code: "VIP25", discountPct: 25, maxUses: 100 },
];

// ── Build the typed catalog records ──────────────────────────────────────────

function buildCatalog() {
  const platforms: Platform[] = [];
  const categories: ServiceCategory[] = [];
  const tiers: PackageTier[] = [];

  PLATFORM_DEFS.forEach((p, pIdx) => {
    const platformId = `fb-${p.slug}`;
    platforms.push({
      id: platformId,
      name: p.name,
      slug: p.slug,
      icon: p.icon,
      gradient: p.gradient,
      description: p.description,
      order: pIdx,
      createdAt: FALLBACK_DATE,
      updatedAt: FALLBACK_DATE,
    });

    p.categories.forEach((c, cIdx) => {
      const categoryId = `fb-${p.slug}-${c.slug}`;
      categories.push({
        id: categoryId,
        platformId,
        name: c.name,
        slug: c.slug,
        description: c.description,
        order: cIdx,
        createdAt: FALLBACK_DATE,
        updatedAt: FALLBACK_DATE,
      });

      c.tiers.forEach((t) => {
        const tierId = `fb-${p.slug}-${c.slug}-${t.tierName === "Standard" ? "std" : "pro"}`;
        tiers.push({
          id: tierId,
          serviceCategoryId: categoryId,
          tierName: t.tierName,
          unitLabel: t.unitLabel,
          basePricePer1000: t.basePricePer1000,
          priceTiers: fallbackLadder(t.basePricePer1000),
          features: t.features,
          deliveryEstimate: t.deliveryEstimate,
          guaranteeDays: t.guaranteeDays,
          minQuantity: 100,
          maxQuantity: 100000,
          active: true,
          createdAt: FALLBACK_DATE,
          updatedAt: FALLBACK_DATE,
        });
      });
    });
  });

  return { platforms, categories, tiers };
}

const built = buildCatalog();

export const FALLBACK_PLATFORMS: Platform[] = built.platforms;
export const FALLBACK_CATEGORIES: ServiceCategory[] = built.categories;
export const FALLBACK_TIERS: PackageTier[] = built.tiers;

export const FALLBACK_REVIEWS: Review[] = REVIEW_DEFS.map((r, i) => ({
  id: `fb-review-${i + 1}`,
  name: r.name,
  rating: r.rating,
  text: r.text,
  platformName: r.platformName,
  verified: true,
  createdAt: FALLBACK_DATE,
}));

export const FALLBACK_COUPONS: Coupon[] = COUPON_DEFS.map((c, i) => ({
  id: `fb-coupon-${i + 1}`,
  code: c.code,
  discountPct: c.discountPct,
  active: true,
  maxUses: c.maxUses,
  usedCount: 0,
  expiresAt: null,
  createdAt: FALLBACK_DATE,
  updatedAt: FALLBACK_DATE,
}));

// ── Lookup helpers (mirror the Prisma queries in lib/catalog.ts) ─────────────

export type PlatformWithCategoriesFallback = Platform & {
  categories: (ServiceCategory & { tiers: PackageTier[] })[];
};

export function getFallbackPlatformBySlug(
  slug: string,
): PlatformWithCategoriesFallback | null {
  const platform = FALLBACK_PLATFORMS.find((p) => p.slug === slug);
  if (!platform) return null;
  const categories = FALLBACK_CATEGORIES.filter((c) => c.platformId === platform.id)
    .sort((a, b) => a.order - b.order)
    .map((c) => ({
      ...c,
      tiers: FALLBACK_TIERS.filter(
        (t) => t.serviceCategoryId === c.id && t.active,
      ).sort((a, b) => a.tierName.localeCompare(b.tierName)),
    }));
  return { ...platform, categories };
}

export type CategoryWithRelationsFallback = ServiceCategory & {
  platform: Platform;
  tiers: PackageTier[];
};

export function getFallbackCategory(
  platformSlug: string,
  categorySlug: string,
): CategoryWithRelationsFallback | null {
  const platform = FALLBACK_PLATFORMS.find((p) => p.slug === platformSlug);
  if (!platform) return null;
  const category = FALLBACK_CATEGORIES.find(
    (c) => c.platformId === platform.id && c.slug === categorySlug,
  );
  if (!category) return null;
  const tiers = FALLBACK_TIERS.filter(
    (t) => t.serviceCategoryId === category.id && t.active,
  ).sort((a, b) => a.tierName.localeCompare(b.tierName));
  return { ...category, platform, tiers };
}

export type TierWithRelationsFallback = PackageTier & {
  serviceCategory: ServiceCategory & { platform: Platform };
};

export function getFallbackTierById(id: string): TierWithRelationsFallback | null {
  const tier = FALLBACK_TIERS.find((t) => t.id === id);
  if (!tier) return null;
  const serviceCategory = FALLBACK_CATEGORIES.find(
    (c) => c.id === tier.serviceCategoryId,
  );
  if (!serviceCategory) return null;
  const platform = FALLBACK_PLATFORMS.find(
    (p) => p.id === serviceCategory.platformId,
  );
  if (!platform) return null;
  return { ...tier, serviceCategory: { ...serviceCategory, platform } };
}

export function findFallbackCoupon(code: string): Coupon | undefined {
  return FALLBACK_COUPONS.find(
    (c) => c.code === code.trim().toUpperCase(),
  );
}

/** Increment in-memory usage for a fallback coupon (demo mode). */
export function incrementFallbackCouponUsage(code: string): void {
  const coupon = findFallbackCoupon(code);
  if (coupon) coupon.usedCount += 1;
}

// ── In-memory order store (used when the database is unavailable) ────────────
// NOTE: on serverless platforms this is per-instance memory. The checkout
// client also persists every order to localStorage, so order tracking keeps
// working even if a later lookup lands on a different instance.

export type FallbackOrderStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REFILL_REQUESTED"
  | "CANCELLED";

export interface FallbackOrder {
  id: string;
  email: string;
  usernameOrUrl: string;
  platformId: string;
  packageTierId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  couponCode: string | null;
  status: FallbackOrderStatus;
  paymentProvider: "stripe" | "card" | "crypto";
  paymentStatus: string;
  createdAt: string; // ISO string
  platform: { name: string };
  packageTier: {
    tierName: string;
    unitLabel: string;
    serviceCategory: { name: string };
  };
}

export const fallbackOrderStore = new Map<string, FallbackOrder>();

const ORDER_ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeFallbackOrderId(): string {
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += ORDER_ID_CHARS[Math.floor(Math.random() * ORDER_ID_CHARS.length)];
  }
  return `SU-${s}`;
}
