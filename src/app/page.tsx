import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPlatforms, getReviews } from "@/lib/catalog";
import { Hero, TrustBadges } from "@/components/home/hero";
import { PlatformGrid } from "@/components/home/platform-grid";
import { HowItWorks } from "@/components/home/how-it-works";
import { ReviewCarousel } from "@/components/home/review-carousel";
import { Faq } from "@/components/home/faq";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [platforms, reviews] = await Promise.all([getPlatforms(), getReviews(9)]);

  return (
    <>
      <Hero />
      <TrustBadges />
      <PlatformGrid platforms={platforms} />
      <HowItWorks />
      <ReviewCarousel reviews={reviews} />
      <Faq />

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/60 via-violet-900/40 to-emerald-900/30 p-10 sm:p-16 text-center">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[500px] -translate-x-1/2 rounded-full bg-indigo-600/30 blur-[100px]" />
          <h2 className="relative text-3xl sm:text-5xl font-extrabold tracking-tight">
            Your next <span className="text-gradient">1,000 followers</span> are one click away.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
            Join 180,000+ creators growing on autopilot. Instant start, zero passwords, guaranteed
            retention.
          </p>
          <div className="relative mt-8">
            <Link href="#platforms">
              <Button size="xl">
                Choose Your Platform <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
