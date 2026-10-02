import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck, Zap } from "lucide-react";
import { getCategory } from "@/lib/catalog";
import { PlatformIcon } from "@/components/platform-icon";
import { PackageConfigurator } from "@/components/package-configurator";
import { Accordion } from "@/components/ui/accordion";
import { cn } from "@/components/ui/cn";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string; category: string }>;
}) {
  const { platform, category } = await params;
  const c = await getCategory(platform, category);
  return { title: c ? `${c.platform.name} ${c.name}` : "Service" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ platform: string; category: string }>;
}) {
  const { platform, category } = await params;
  const cat = await getCategory(platform, category);
  if (!cat || cat.tiers.length === 0) notFound();

  const unit = cat.tiers[0].unitLabel;

  const faqs = [
    {
      title: `Do you need my ${cat.platform.name} password for ${unit}?`,
      content:
        "No — never. We only need your public username or a link to the post/video. Our delivery system is designed to work with zero login access, which is exactly what keeps your account safe.",
    },
    {
      title: `How fast will my ${unit} arrive?`,
      content: `Most orders start within 15–60 minutes and complete inside the delivery estimate shown on each tier (${cat.tiers.map((t) => t.tierName + ": " + t.deliveryEstimate).join(" · ")}). Large orders are drip-fed to look natural.`,
    },
    {
      title: "Which tier should I choose?",
      content:
        "Standard is high-value and ideal for quick social proof. Premium/VIP uses active, targeted real-looking accounts with niche/geo targeting, faster delivery and a longer refill guarantee — the pick for creators building a monetizable audience.",
    },
    {
      title: `What if my ${unit} drop?`,
      content: `Every tier includes a refill guarantee (${cat.tiers.map((t) => `${t.tierName}: ${t.guaranteeDays} days`).join(", ")}). If numbers dip within the window, request a free refill from the order tracker.`,
    },
    {
      title: "How do bulk discounts work?",
      content:
        "Pricing drops automatically at quantity breakpoints — up to 45% off at 100K units. The configurator above shows your exact per-1K price and savings in real time.",
    },
  ];

  return (
    <div className="pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Link
          href={`/services/${cat.platform.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> {cat.platform.name} services
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <span
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-xl",
              cat.platform.gradient,
            )}
          >
            <PlatformIcon name={cat.platform.icon} className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {cat.platform.name} <span className="text-gradient">{cat.name}</span>
            </h1>
            <p className="mt-2 max-w-2xl text-slate-400">{cat.description}</p>
          </div>
        </div>

        <div className="mt-10">
          <PackageConfigurator
            tiers={cat.tiers}
            platformName={cat.platform.name}
            categoryName={cat.name}
          />
        </div>

        {/* Safety strip */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Lock, title: "No password required", text: "Public username or link is all we need." },
            { icon: Zap, title: "Instant start", text: "Most orders begin within the hour, 24/7." },
            { icon: ShieldCheck, title: "Refill guarantee", text: "Drops get refilled free — automatically." },
          ].map((b) => (
            <div key={b.title} className="glass flex items-center gap-4 rounded-2xl p-5">
              <b.icon className="h-8 w-8 shrink-0 text-emerald-300" />
              <div>
                <div className="font-semibold text-white">{b.title}</div>
                <div className="text-sm text-slate-400">{b.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Per-service FAQ */}
        <div className="mx-auto mt-14 max-w-4xl">
          <h2 className="text-center text-2xl font-extrabold tracking-tight">
            {cat.name} <span className="text-gradient">FAQ</span>
          </h2>
          <Accordion items={faqs} className="mt-6" />
        </div>
      </div>
    </div>
  );
}
