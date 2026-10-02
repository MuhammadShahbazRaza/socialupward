import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PlatformIcon } from "../platform-icon";
import { cn } from "../ui/cn";
import type { Platform } from "@prisma/client";

export function PlatformGrid({ platforms }: { platforms: Platform[] }) {
  if (platforms.length === 0) {
    return (
      <section id="platforms" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 scroll-mt-20">
        <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-10 text-center">
          <h2 className="text-xl font-semibold text-white">Catalog is warming up</h2>
          <p className="mt-2 text-sm text-slate-400">
            The service catalog loads from the database. Run <code className="text-indigo-300">npx prisma db seed</code> to
            populate it, then refresh.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="platforms" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 scroll-mt-20">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Pick your platform. <span className="text-gradient">Pick your growth.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Seven networks, dozens of services, two quality tiers. Every package is tuned for that
          platform&apos;s algorithm — not one-size-fits-all.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((p) => (
          <Link
            key={p.id}
            href={`/services/${p.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-800/60 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-950/40"
          >
            <div
              className={cn(
                "absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80",
                p.gradient,
              )}
            />
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                  p.gradient,
                )}
              >
                <PlatformIcon name={p.icon} className="h-7 w-7" />
              </span>
              <ArrowRight className="h-5 w-5 text-slate-500 transition-all group-hover:translate-x-1 group-hover:text-indigo-300" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-white">{p.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.description}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-indigo-300 group-hover:text-indigo-200">
              View services →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
