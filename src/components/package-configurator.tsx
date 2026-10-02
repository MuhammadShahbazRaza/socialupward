"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Crown, Zap, ShieldCheck, Truck, ArrowRight, Tag } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { Card, CardContent } from "./ui/card";
import { cn } from "./ui/cn";
import { parsePriceTiers, tierForQuantity, quotePrice, formatUSD, formatCompact } from "@/lib/pricing";
import type { PackageTier } from "@prisma/client";

const QUICK_QTYS = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000];

export function PackageConfigurator({
  tiers,
  platformName,
  categoryName,
}: {
  tiers: PackageTier[];
  platformName: string;
  categoryName: string;
}) {
  const router = useRouter();
  const [tierId, setTierId] = useState(tiers[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1000);

  const tier = useMemo(() => tiers.find((t) => t.id === tierId) ?? tiers[0], [tiers, tierId]);
  const priceTiers = useMemo(() => parsePriceTiers(tier?.priceTiers), [tier]);

  const quote = useMemo(
    () => (tier ? quotePrice(priceTiers, quantity) : null),
    [tier, priceTiers, quantity],
  );
  const activeBreakpoint = useMemo(
    () => tierForQuantity(priceTiers, quantity),
    [priceTiers, quantity],
  );

  const isPremium = tier?.tierName.toLowerCase().includes("premium");

  const buyNow = () => {
    if (!tier) return;
    const params = new URLSearchParams({
      tier: tier.id,
      qty: String(quantity),
    });
    router.push(`/checkout?${params.toString()}`);
  };

  if (!tier || !quote) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Left: configuration */}
      <Card className="lg:col-span-3">
        <CardContent className="p-6 sm:p-8">
          {/* Tier toggle */}
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            1 · Choose your tier
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {tiers.map((t) => {
              const active = t.id === tierId;
              const premium = t.tierName.toLowerCase().includes("premium");
              return (
                <button
                  key={t.id}
                  onClick={() => setTierId(t.id)}
                  className={cn(
                    "relative rounded-2xl border-2 p-4 text-left transition-all cursor-pointer",
                    active
                      ? premium
                        ? "border-amber-400/70 bg-amber-400/5 shadow-lg shadow-amber-500/10"
                        : "border-indigo-400/70 bg-indigo-500/5 shadow-lg shadow-indigo-500/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25",
                  )}
                >
                  {premium && (
                    <Badge tone="amber" className="absolute -top-2.5 right-3">
                      <Crown className="h-3 w-3" /> Most popular
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 font-semibold text-white">
                    {premium ? (
                      <Crown className="h-4 w-4 text-amber-300" />
                    ) : (
                      <Zap className="h-4 w-4 text-indigo-300" />
                    )}
                    {t.tierName}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {premium ? "Active & targeted" : "High-value"} · from{" "}
                    {formatUSD(t.basePricePer1000)}/1K
                  </p>
                </button>
              );
            })}
          </div>

          {/* Quantity */}
          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-slate-400">
            2 · Choose quantity <span className="normal-case text-slate-500">({tier.unitLabel})</span>
          </h3>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {QUICK_QTYS.map((q) => (
              <button
                key={q}
                onClick={() => setQuantity(q)}
                className={cn(
                  "rounded-xl border px-2 py-2.5 text-sm font-semibold transition-all cursor-pointer",
                  quantity === q
                    ? "border-indigo-400 bg-indigo-500/15 text-white shadow-md shadow-indigo-600/20"
                    : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/25 hover:text-white",
                )}
              >
                {formatCompact(q)}
              </button>
            ))}
          </div>
          <div className="mt-5">
            <Slider
              value={quantity}
              min={tier.minQuantity}
              max={tier.maxQuantity}
              step={100}
              onChange={setQuantity}
              aria-label="Quantity"
            />
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>{tier.minQuantity.toLocaleString()}</span>
              <span className="font-semibold text-white text-sm">
                {quantity.toLocaleString()} {tier.unitLabel}
              </span>
              <span>{tier.maxQuantity.toLocaleString()}</span>
            </div>
          </div>

          {/* Price ladder */}
          <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
            <div className="grid grid-cols-4 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-wider text-slate-500">
              <span>Qty</span>
              <span>Per 1K</span>
              <span>You save</span>
              <span className="text-right">Total</span>
            </div>
            {priceTiers.map((pt) => {
              const q = quotePrice(priceTiers, pt.qty)!;
              const active = activeBreakpoint?.qty === pt.qty;
              return (
                <button
                  key={pt.qty}
                  onClick={() => setQuantity(pt.qty)}
                  className={cn(
                    "grid w-full grid-cols-4 items-center px-4 py-2.5 text-sm transition cursor-pointer",
                    active ? "bg-indigo-500/10 text-white" : "text-slate-400 hover:bg-white/[0.03]",
                  )}
                >
                  <span className="font-medium">{formatCompact(pt.qty)}</span>
                  <span>{formatUSD(pt.pricePer1000)}</span>
                  <span>
                    {pt.discountPct > 0 ? (
                      <Badge tone="emerald" className="text-[11px]">
                        <Tag className="h-3 w-3" /> −{pt.discountPct}%
                      </Badge>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </span>
                  <span className="text-right font-semibold">{formatUSD(q.total)}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Right: order summary */}
      <div className="lg:col-span-2">
        <Card className={cn("sticky top-24 border-2", isPremium ? "border-amber-400/30" : "border-indigo-400/30")}>
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Order summary</h3>
              <Badge tone={isPremium ? "amber" : "indigo"}>{tier.tierName}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {platformName} · {categoryName}
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Quantity</span>
                <span className="font-semibold text-white">
                  {quantity.toLocaleString()} {tier.unitLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Price per 1,000</span>
                <span className="font-semibold text-white">{formatUSD(quote.pricePer1000)}</span>
              </div>
              {activeBreakpoint && activeBreakpoint.discountPct > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Bulk discount</span>
                  <span className="font-semibold text-emerald-300">
                    −{activeBreakpoint.discountPct}%
                  </span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                <span className="text-slate-300 font-medium">Total</span>
                <span className="text-3xl font-extrabold text-gradient">{formatUSD(quote.total)}</span>
              </div>
            </div>

            <Button size="lg" className="mt-6 w-full" onClick={buyNow}>
              Buy Now <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="mt-3 text-center text-xs text-slate-500">
              Secure checkout · No account needed · No password ever
            </p>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
              {tier.features.map((f) => (
                <div key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {f}
                </div>
              ))}
              <div className="flex items-center gap-2.5 text-sm text-slate-400">
                <Truck className="h-4 w-4 text-indigo-300" />
                Delivery: {tier.deliveryEstimate}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                {tier.guaranteeDays}-day refill guarantee
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
