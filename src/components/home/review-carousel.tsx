"use client";

import { useState, useEffect } from "react";
import { Star, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../ui/cn";
import type { Review } from "@prisma/client";

export function ReviewCarousel({ reviews }: { reviews: Review[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 6000);
    return () => clearInterval(t);
  }, [reviews.length]);

  if (reviews.length === 0) return null;

  const visible = 3;
  const items: Review[] = [];
  for (let i = 0; i < Math.min(visible, reviews.length); i++) {
    items.push(reviews[(index + i) % reviews.length]);
  }

  return (
    <section id="reviews" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Loved by <span className="text-gradient">creators everywhere</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Every review below is from a verified order. We publish the good, the great, and the
          honest.
        </p>
      </div>

      <div className="relative mt-12">
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((r, i) => (
            <figure
              key={`${r.id}-${i}`}
              className={cn(
                "glass rounded-2xl p-6 flex flex-col transition-opacity",
                i === 0 ? "opacity-100" : "opacity-70 hidden md:flex",
              )}
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, s) => (
                  <Star
                    key={s}
                    className={cn(
                      "h-4 w-4",
                      s < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-600",
                    )}
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-300">
                &ldquo;{r.text}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    {r.name}
                    {r.verified && <BadgeCheck className="h-4 w-4 text-emerald-400" />}
                  </div>
                  <div className="text-xs text-slate-500">{r.platformName} customer</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setIndex((index - 1 + reviews.length) % reviews.length)}
            className="rounded-full border border-white/10 p-2.5 text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-1.5">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to review ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all cursor-pointer",
                  i === index ? "w-6 bg-indigo-400" : "w-2 bg-white/20 hover:bg-white/40",
                )}
              />
            ))}
          </div>
          <button
            onClick={() => setIndex((index + 1) % reviews.length)}
            className="rounded-full border border-white/10 p-2.5 text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer"
            aria-label="Next reviews"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
