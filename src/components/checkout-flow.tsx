"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShieldCheck,
  Lock,
  CreditCard,
  Bitcoin,
  Loader2,
  PartyPopper,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { parsePriceTiers, quotePrice, formatUSD, shortOrderId } from "@/lib/pricing";

type TierPayload = {
  id: string;
  tierName: string;
  unitLabel: string;
  minQuantity: number;
  maxQuantity: number;
  priceTiers: unknown;
  deliveryEstimate: string;
  guaranteeDays: number;
  serviceCategory: {
    name: string;
    platform: { name: string; slug: string };
  };
};

const STEPS = ["Package", "Your details", "Payment"];

export function CheckoutFlow() {
  const searchParams = useSearchParams();
  const tierId = searchParams.get("tier") ?? "";
  const initialQty = Number(searchParams.get("qty")) || 1000;

  const [step, setStep] = useState(0);
  const [tier, setTier] = useState<TierPayload | null>(null);
  // Initial state reflects the URL params directly — the effect below only
  // fetches data, it never "corrects" state synchronously.
  const [loading, setLoading] = useState(Boolean(tierId));
  const [error, setError] = useState(
    tierId ? "" : "No package selected. Please choose a service first.",
  );

  const [quantity, setQuantity] = useState(initialQty);
  const [couponInput, setCouponInput] = useState("");
  const [couponPct, setCouponPct] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponOk, setCouponOk] = useState(false);

  const [usernameOrUrl, setUsernameOrUrl] = useState("");
  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState<"stripe" | "card" | "crypto">("stripe");
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState<{ orderId: string; total: number } | null>(null);

  // Fetch the selected tier once. State updates happen in async
  // continuations (with a cancellation guard), never synchronously here.
  useEffect(() => {
    if (!tierId) return;
    let cancelled = false;
    fetch(`/api/tiers/${tierId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (cancelled) return;
        setTier(d.tier);
        setQuantity((q) => Math.min(Math.max(q, d.tier.minQuantity), d.tier.maxQuantity));
      })
      .catch(() => {
        if (!cancelled) setError("Could not load this package. It may be unavailable.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tierId]);

  const priceTiers = useMemo(() => parsePriceTiers(tier?.priceTiers), [tier]);
  const quote = useMemo(
    () => (tier ? quotePrice(priceTiers, quantity, couponPct) : null),
    [tier, priceTiers, quantity, couponPct],
  );

  const applyCoupon = async () => {
    setCouponMsg("");
    if (!couponInput.trim()) return;
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput }),
    });
    const d = await res.json();
    if (d.valid) {
      setCouponPct(d.discountPct);
      setCouponOk(true);
      setCouponMsg(`Code ${d.code} applied — ${d.discountPct}% off`);
    } else {
      setCouponPct(0);
      setCouponOk(false);
      setCouponMsg(d.error ?? "Invalid code");
    }
  };

  const validDetails =
    usernameOrUrl.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const placeOrder = async () => {
    if (!tier || !quote) return;
    setPlacing(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId: tier.id,
          quantity,
          email: email.trim(),
          usernameOrUrl: usernameOrUrl.trim(),
          couponCode: couponOk ? couponInput.trim().toUpperCase() : undefined,
          paymentProvider: provider,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Order failed");
      // Payment hook: if Stripe returns a hosted URL, redirect there.
      if (d.payment?.url) {
        window.location.href = d.payment.url;
        return;
      }
      setDone({ orderId: d.orderId, total: d.total });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Order failed");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
          <PartyPopper className="h-10 w-10 text-emerald-300" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold">Order placed successfully!</h1>
        <p className="mt-3 text-slate-400">
          Your growth is queued and will start shortly. Save your order ID — you&apos;ll need it
          with your email to track progress.
        </p>
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="text-sm text-slate-400">Order ID</div>
            <div className="mt-1 font-mono text-2xl font-bold tracking-widest text-gradient">
              {shortOrderId(done.orderId)}
            </div>
            <div className="mt-3 text-sm text-slate-400">
              Total charged: <strong className="text-white">{formatUSD(done.total)}</strong>
            </div>
          </CardContent>
        </Card>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/track-order?order=${done.orderId}&email=${encodeURIComponent(email)}`}>
            <Button size="lg">Track My Order</Button>
          </Link>
          <Link href="/#platforms">
            <Button size="lg" variant="secondary">Order More</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-10">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                  i < step
                    ? "bg-emerald-500 text-white"
                    : i === step
                      ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
                      : "bg-white/10 text-slate-400",
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn("text-sm font-medium hidden sm:block", i === step ? "text-white" : "text-slate-400")}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="h-px w-8 sm:w-16 bg-white/15" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            {error}
            {!tier && (
              <div className="mt-2">
                <Link href="/#platforms" className="underline font-medium">
                  Browse services
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {tier && quote && (
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {/* STEP 1 — package */}
            {step === 0 && (
              <Card>
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white">Review your package</h2>
                  <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-white">
                        {tier.serviceCategory.platform.name} · {tier.serviceCategory.name}
                      </div>
                      <Badge tone={tier.tierName.includes("Premium") ? "amber" : "indigo"}>
                        {tier.tierName}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <Label>Quantity ({tier.unitLabel})</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[100, 500, 1000, 5000, 10000, 25000, 50000, 100000]
                          .filter((q) => q >= tier.minQuantity && q <= tier.maxQuantity)
                          .map((q) => (
                            <button
                              key={q}
                              onClick={() => setQuantity(q)}
                              className={cn(
                                "rounded-lg border px-3 py-1.5 text-sm font-semibold cursor-pointer transition",
                                quantity === q
                                  ? "border-indigo-400 bg-indigo-500/15 text-white"
                                  : "border-white/10 text-slate-400 hover:text-white hover:border-white/25",
                              )}
                            >
                              {q >= 1000 ? `${q / 1000}K` : q}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Label>Discount code (optional)</Label>
                    <div className="mt-1.5 flex gap-2">
                      <Input
                        placeholder="e.g. WELCOME10"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="uppercase"
                      />
                      <Button variant="secondary" onClick={applyCoupon}>
                        <Tag className="h-4 w-4" /> Apply
                      </Button>
                    </div>
                    {couponMsg && (
                      <p className={cn("mt-2 text-sm", couponOk ? "text-emerald-300" : "text-red-300")}>
                        {couponMsg}
                      </p>
                    )}
                  </div>

                  <Button size="lg" className="mt-6 w-full" onClick={() => setStep(1)}>
                    Continue <ArrowRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* STEP 2 — details */}
            {step === 1 && (
              <Card>
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white">Where should we deliver?</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    We only need your <strong className="text-slate-200">public</strong> profile or
                    post — delivery is fully external.
                  </p>

                  <div className="mt-5 space-y-4">
                    <div>
                      <Label>Public username or post/video URL</Label>
                      <Input
                        placeholder="@yourhandle or https://…"
                        value={usernameOrUrl}
                        onChange={(e) => setUsernameOrUrl(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Email (for your order ID & updates)</Label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <Lock className="h-5 w-5 shrink-0 text-emerald-300" />
                    <p className="text-sm text-emerald-100">
                      <strong>We will never ask for your password.</strong> Anyone who does is not
                      us. Your account stays 100% in your control.
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button variant="secondary" onClick={() => setStep(0)}>
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button size="lg" className="flex-1" disabled={!validDetails} onClick={() => setStep(2)}>
                      Continue to Payment <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                  {!validDetails && (
                    <p className="mt-2 text-xs text-slate-500">
                      Enter a valid username/URL and email to continue.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* STEP 3 — payment */}
            {step === 2 && (
              <Card>
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white">Payment</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Choose how you&apos;d like to pay. Card payments are processed securely via
                    Stripe — we never see your card details.
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "stripe", label: "Stripe", icon: CreditCard },
                        { id: "card", label: "Card", icon: CreditCard },
                        { id: "crypto", label: "Crypto", icon: Bitcoin },
                      ] as const
                    ).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setProvider(p.id)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border p-4 text-sm font-medium transition cursor-pointer",
                          provider === p.id
                            ? "border-indigo-400 bg-indigo-500/15 text-white"
                            : "border-white/10 text-slate-400 hover:border-white/25 hover:text-white",
                        )}
                      >
                        <p.icon className="h-6 w-6" />
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
                    {provider === "crypto" ? (
                      <p>
                        You&apos;ll receive a crypto invoice (BTC, ETH, USDT…) after confirming.
                        Orders are queued the moment your transaction is detected.
                      </p>
                    ) : (
                      <p>
                        You&apos;ll be redirected to a secure hosted checkout to complete payment.
                        Your order is created first so nothing is lost if you navigate away.
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button variant="secondary" onClick={() => setStep(1)} disabled={placing}>
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button size="lg" className="flex-1" onClick={placeOrder} disabled={placing}>
                      {placing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" /> Placing order…
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-5 w-5" /> Pay {formatUSD(quote.total)}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-2">
            <Card className="lg:sticky lg:top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white">Order summary</h3>
                <div className="mt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Service</span>
                    <span className="text-right font-medium text-white">
                      {tier.serviceCategory.platform.name} {tier.serviceCategory.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tier</span>
                    <span className="font-medium text-white">{tier.tierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quantity</span>
                    <span className="font-medium text-white">
                      {quantity.toLocaleString()} {tier.unitLabel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-medium text-white">{formatUSD(quote.subtotal)}</span>
                  </div>
                  {quote.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Coupon (−{quote.discountPct}%)</span>
                      <span className="font-medium text-emerald-300">
                        −{formatUSD(quote.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/10 pt-3 text-base">
                    <span className="font-medium text-slate-200">Total</span>
                    <span className="font-extrabold text-gradient text-xl">{formatUSD(quote.total)}</span>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  <p>✓ Delivery: {tier.deliveryEstimate}</p>
                  <p>✓ {tier.guaranteeDays}-day refill guarantee included</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
