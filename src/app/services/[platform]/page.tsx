import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { getPlatformBySlug } from "@/lib/catalog";
import { PlatformIcon } from "@/components/platform-icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { formatUSD } from "@/lib/pricing";
import { parsePriceTiers } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const p = await getPlatformBySlug(platform);
  return { title: p ? `${p.name} Growth Services` : "Services" };
}

export default async function PlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform: slug } = await params;
  const platform = await getPlatformBySlug(slug);
  if (!platform) notFound();

  return (
    <div className="pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Link
          href="/#platforms"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> All platforms
        </Link>

        <div className="mt-6 flex items-center gap-5">
          <span
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-xl",
              platform.gradient,
            )}
          >
            <PlatformIcon name={platform.icon} className="h-8 w-8" />
          </span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {platform.name} <span className="text-gradient">Growth Services</span>
            </h1>
            <p className="mt-2 max-w-2xl text-slate-400">{platform.description}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {platform.categories.map((cat) => {
            const cheapest = cat.tiers.length
              ? Math.min(...cat.tiers.map((t) => parsePriceTiers(t.priceTiers)[0]?.pricePer1000 ?? Infinity))
              : null;
            return (
              <Link
                key={cat.id}
                href={`/services/${platform.slug}/${cat.slug}`}
                className="group rounded-2xl border border-white/10 bg-ink-800/60 p-6 transition-all hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-xl hover:shadow-indigo-950/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white group-hover:text-indigo-200">
                      {cat.name}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{cat.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-slate-500 transition-all group-hover:translate-x-1 group-hover:text-indigo-300" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {cat.tiers.map((t) => (
                    <Badge key={t.id} tone={t.tierName.includes("Premium") ? "amber" : "indigo"}>
                      {t.tierName}
                    </Badge>
                  ))}
                  {cheapest !== null && cheapest !== Infinity && (
                    <span className="ml-auto text-sm text-slate-400">
                      from <strong className="text-emerald-300">{formatUSD(cheapest)}</strong>/1K
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
