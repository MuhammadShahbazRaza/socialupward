import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type PriceTier = { qty: number; pricePer1000: number; discountPct: number };

const QUANTITIES = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000];

/** Generate a descending per-1000 price ladder from a base price. */
function ladder(basePer1000: number): PriceTier[] {
  const discountByQty: Record<number, number> = {
    100: 0,
    500: 5,
    1000: 10,
    5000: 18,
    10000: 25,
    25000: 32,
    50000: 38,
    100000: 45,
  };
  return QUANTITIES.map((qty) => {
    const discountPct = discountByQty[qty];
    const pricePer1000 = Math.round(basePer1000 * (1 - discountPct / 100) * 100) / 100;
    return { qty, pricePer1000, discountPct };
  });
}

type TierSeed = {
  tierName: "Standard" | "Premium/VIP";
  unitLabel: string;
  basePricePer1000: number;
  features: string[];
  deliveryEstimate: string;
  guaranteeDays: number;
};

type CategorySeed = {
  name: string;
  slug: string;
  description: string;
  tiers: TierSeed[];
};

type PlatformSeed = {
  name: string;
  slug: string;
  icon: string;
  gradient: string;
  description: string;
  categories: CategorySeed[];
};

const standard = (
  unitLabel: string,
  basePricePer1000: number,
  features: string[],
  deliveryEstimate = "1–24 hours",
): TierSeed => ({
  tierName: "Standard",
  unitLabel,
  basePricePer1000,
  features,
  deliveryEstimate,
  guaranteeDays: 30,
});

const premium = (
  unitLabel: string,
  basePricePer1000: number,
  features: string[],
  deliveryEstimate = "1–12 hours",
): TierSeed => ({
  tierName: "Premium/VIP",
  unitLabel,
  basePricePer1000,
  features,
  deliveryEstimate,
  guaranteeDays: 60,
});

const PLATFORMS: PlatformSeed[] = [
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
          standard("followers", 12.99, [
            "High-quality profiles with avatars",
            "Gradual natural delivery",
            "No password required",
            "30-day refill guarantee",
          ]),
          premium("followers", 24.99, [
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
          standard("likes", 4.99, [
            "High-retention likes",
            "Instant start (0–1 hour)",
            "Drip-feed available",
            "No password required",
          ]),
          premium("likes", 9.99, [
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
          standard("views", 2.49, [
            "High-retention reels views",
            "Start within 1 hour",
            "Works on reels, stories & videos",
            "30-day refill guarantee",
          ]),
          premium("views", 4.99, [
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
          standard("followers", 14.99, [
            "High-quality TikTok profiles",
            "Natural gradual delivery",
            "No password required",
            "30-day refill guarantee",
          ]),
          premium("followers", 27.99, [
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
          standard("likes", 5.99, [
            "Instant start likes",
            "Drip-feed for natural growth",
            "Shares & saves available",
            "No password required",
          ]),
          premium("likes", 11.99, [
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
          standard("views", 2.99, [
            "Fast-start video views",
            "FYP-optimized pacing",
            "Live stream views available",
            "30-day refill guarantee",
          ]),
          premium("views", 5.49, [
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
          standard("live-viewers", 19.99, [
            "Stable concurrent viewers",
            "30–120 min sessions",
            "Start within 15 minutes",
            "No password required",
          ]),
          premium("live-viewers", 34.99, [
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
          standard("subscribers", 39.99, [
            "High-quality subscriber profiles",
            "Gradual safe delivery",
            "No password required",
            "30-day refill guarantee",
          ]),
          premium("subscribers", 69.99, [
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
          standard("views", 7.99, [
            "High-retention views",
            "Real watch-time delivery",
            "Search & suggested boost",
            "30-day refill guarantee",
          ]),
          premium("views", 13.99, [
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
          standard("likes", 6.99, [
            "High-retention likes",
            "Drip-feed delivery",
            "No password required",
            "30-day refill guarantee",
          ]),
          premium("likes", 12.99, [
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
          standard("live-viewers", 24.99, [
            "Stable concurrent viewers",
            "Premiere-ready delivery",
            "Start within 15 minutes",
            "No password required",
          ]),
          premium("live-viewers", 44.99, [
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
          standard("followers", 11.99, [
            "High-quality profiles",
            "Gradual delivery",
            "No password required",
            "30-day refill guarantee",
          ]),
          premium("followers", 22.99, [
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
          standard("likes", 5.49, [
            "Instant-start engagement",
            "Reposts & replies available",
            "No password required",
          ]),
          premium("likes", 10.49, [
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
          standard("followers", 9.99, [
            "High-quality page followers",
            "Gradual delivery",
            "No password required",
            "30-day refill guarantee",
          ]),
          premium("followers", 18.99, [
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
          standard("likes", 4.49, [
            "Reactions & likes",
            "Shares available",
            "No password required",
          ]),
          premium("likes", 8.99, [
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
          standard("live-viewers", 17.99, [
            "Stable concurrent viewers",
            "Start within 15 minutes",
            "Up to 6-hour sessions",
            "No password required",
          ]),
          premium("live-viewers", 32.99, [
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
          standard("followers", 10.99, [
            "High-quality followers",
            "Gradual delivery",
            "No password required",
            "30-day refill guarantee",
          ]),
          premium("followers", 19.99, [
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
          standard("streams", 6.99, [
            "High-retention streams",
            "Natural delivery pacing",
            "No password required",
            "30-day refill guarantee",
          ]),
          premium("streams", 12.49, [
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
          standard("monthly-listeners", 8.99, [
            "Monthly listeners",
            "Natural pacing",
            "No password required",
          ]),
          premium("monthly-listeners", 15.99, [
            "Premium listeners",
            "Follower bundles",
            "Playlist consideration",
          ]),
        ],
      },
    ],
  },
];

const REVIEWS = [
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

const COUPONS = [
  { code: "WELCOME10", discountPct: 10, maxUses: 1000 },
  { code: "GROW20", discountPct: 20, maxUses: 200 },
  { code: "VIP25", discountPct: 25, maxUses: 100 },
];

async function main() {
  console.log("🌱 Seeding SocialUpward database...");

  // Clean existing data (order matters for FK constraints)
  await prisma.order.deleteMany();
  await prisma.packageTier.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.platform.deleteMany();
  await prisma.review.deleteMany();
  await prisma.coupon.deleteMany();

  let platformCount = 0;
  let categoryCount = 0;
  let tierCount = 0;

  for (const [pIdx, p] of PLATFORMS.entries()) {
    const platform = await prisma.platform.create({
      data: {
        name: p.name,
        slug: p.slug,
        icon: p.icon,
        gradient: p.gradient,
        description: p.description,
        order: pIdx,
      },
    });
    platformCount++;

    for (const [cIdx, c] of p.categories.entries()) {
      const category = await prisma.serviceCategory.create({
        data: {
          platformId: platform.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          order: cIdx,
        },
      });
      categoryCount++;

      for (const t of c.tiers) {
        await prisma.packageTier.create({
          data: {
            serviceCategoryId: category.id,
            tierName: t.tierName,
            unitLabel: t.unitLabel,
            basePricePer1000: t.basePricePer1000,
            priceTiers: ladder(t.basePricePer1000),
            features: t.features,
            deliveryEstimate: t.deliveryEstimate,
            guaranteeDays: t.guaranteeDays,
          },
        });
        tierCount++;
      }
    }
  }

  for (const r of REVIEWS) {
    await prisma.review.create({ data: r });
  }

  for (const c of COUPONS) {
    await prisma.coupon.create({ data: c });
  }

  console.log(`✅ Seeded ${platformCount} platforms, ${categoryCount} categories, ${tierCount} tiers`);
  console.log(`✅ Seeded ${REVIEWS.length} reviews, ${COUPONS.length} coupons`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
