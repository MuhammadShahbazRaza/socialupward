"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, Rocket, PackageSearch, LayoutDashboard } from "lucide-react";
import { PlatformIcon } from "./platform-icon";
import { cn } from "./ui/cn";
import { Button } from "./ui/button";
import type { Platform } from "@prisma/client";

export function SiteNav({ platforms }: { platforms: Platform[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-emerald-400 shadow-lg shadow-indigo-600/40">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Social<span className="text-gradient">Upward</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setDropOpen(true)}
            onMouseLeave={() => setDropOpen(false)}
          >
            <button className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer">
              Services
              <ChevronDown className={cn("h-4 w-4 transition-transform", dropOpen && "rotate-180")} />
            </button>
            {dropOpen && (
              <div className="absolute left-0 top-full w-[560px] pt-2">
                <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-ink-900/95 p-3 shadow-2xl backdrop-blur-xl">
                  {platforms.map((p) => (
                    <Link
                      key={p.id}
                      href={`/services/${p.slug}`}
                      className="group flex items-center gap-3 rounded-xl p-3 hover:bg-white/5"
                      onClick={() => setDropOpen(false)}
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
                          p.gradient,
                        )}
                      >
                        <PlatformIcon name={p.icon} className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-white">{p.name}</span>
                        <span className="block text-xs text-slate-400">
                          {p.description.slice(0, 52)}…
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link
            href="/track-order"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5"
          >
            <PackageSearch className="h-4 w-4" /> Track Order
          </Link>
          <Link
            href="/#reviews"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5"
          >
            Reviews
          </Link>
          <Link
            href="/#faq"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5"
          >
            FAQ
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5"
          >
            <LayoutDashboard className="h-4 w-4" /> Admin
          </Link>
        </nav>

        <div className="hidden lg:block">
          <Link href="/#platforms">
            <Button size="sm">Grow Now</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-ink-950/95 px-4 py-4 backdrop-blur-xl lg:hidden">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Services by platform
          </p>
          <div className="grid grid-cols-1 gap-1">
            {platforms.map((p) => (
              <Link
                key={p.id}
                href={`/services/${p.slug}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                    p.gradient,
                  )}
                >
                  <PlatformIcon name={p.icon} className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-white">{p.name}</span>
              </Link>
            ))}
          </div>
          <div className="mt-3 flex gap-2 border-t border-white/10 pt-4">
            <Link href="/track-order" onClick={() => setMobileOpen(false)} className="flex-1">
              <Button variant="secondary" className="w-full" size="sm">
                Track Order
              </Button>
            </Link>
            <Link href="/#platforms" onClick={() => setMobileOpen(false)} className="flex-1">
              <Button className="w-full" size="sm">
                Grow Now
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function Navbar({ platforms }: { platforms: Platform[] }) {
  return <SiteNav platforms={platforms} />;
}
