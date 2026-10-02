import Link from "next/link";
import { ArrowRight, Zap, ShieldCheck, TrendingUp, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const stats = [
  { value: "2.4M+", label: "Orders delivered" },
  { value: "180K+", label: "Happy creators" },
  { value: "4.9/5", label: "Average rating" },
  { value: "< 1 hr", label: "Avg. start time" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/25 blur-[140px]" />
        <div className="absolute top-40 -left-40 h-[400px] w-[400px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-64 -right-40 h-[400px] w-[400px] rounded-full bg-emerald-500/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
        <Badge tone="indigo" className="mb-6 px-4 py-1.5 text-xs">
          <Zap className="h-3.5 w-3.5" /> Trusted by 180,000+ creators & brands
        </Badge>

        <h1 className="mx-auto max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
          Grow every social platform.
          <br />
          <span className="text-gradient">Faster than ever.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
          Real-looking followers, engagement and views for Instagram, TikTok, YouTube and 4 more
          platforms. No passwords, instant start, and a 30-day retention guarantee on every order.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="#platforms">
            <Button size="lg" className="w-full sm:w-auto">
              Start Growing <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/track-order">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Track Your Order
            </Button>
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-400">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span>
            <strong className="text-white">4.9/5</strong> from 12,400+ verified reviews
          </span>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <div className="text-2xl sm:text-3xl font-extrabold text-gradient">{s.value}</div>
              <div className="mt-1 text-xs sm:text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustBadges() {
  const badges = [
    {
      icon: Zap,
      title: "Instant Delivery",
      text: "Most orders start within 60 minutes, 24/7 — even on weekends.",
      color: "text-amber-300",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: ShieldCheck,
      title: "30-Day Retention Guarantee",
      text: "Any drop in numbers gets refilled free. No questions, no forms.",
      color: "text-emerald-300",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: TrendingUp,
      title: "24/7 Human Support",
      text: "Real people on live chat around the clock, average reply under 5 minutes.",
      color: "text-indigo-300",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="grid gap-4 md:grid-cols-3">
        {badges.map((b) => (
          <div key={b.title} className={`rounded-2xl border p-5 flex gap-4 ${b.bg}`}>
            <b.icon className={`h-8 w-8 shrink-0 ${b.color}`} />
            <div>
              <h3 className="font-semibold text-white">{b.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{b.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
