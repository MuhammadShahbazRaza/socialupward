import Link from "next/link";
import { Rocket, ShieldCheck, Lock, Headset } from "lucide-react";

export function Footer() {
  const platformLinks = [
    { name: "Instagram", slug: "instagram" },
    { name: "TikTok", slug: "tiktok" },
    { name: "YouTube", slug: "youtube" },
    { name: "X (Twitter)", slug: "x-twitter" },
    { name: "Facebook", slug: "facebook" },
    { name: "Twitch", slug: "twitch" },
    { name: "Spotify", slug: "spotify" },
  ];

  return (
    <footer className="border-t border-white/10 bg-ink-900/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-emerald-400">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                Social<span className="text-gradient">Upward</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              The growth partner for 180,000+ creators and brands. Real-looking engagement, instant
              delivery, and a 30-day retention guarantee — without ever asking for your password.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-400" /> No password required
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> 30-day guarantee
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5">
                <Headset className="h-3.5 w-3.5 text-violet-400" /> 24/7 support
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Platforms
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {platformLinks.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/services/${p.slug}`}
                    className="text-slate-400 hover:text-white transition"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Company
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/track-order" className="text-slate-400 hover:text-white transition">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/#reviews" className="text-slate-400 hover:text-white transition">
                  Reviews
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-slate-400 hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-slate-400 hover:text-white transition">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SocialUpward.com — All rights reserved.</p>
          <p>
            Not affiliated with Instagram, TikTok, YouTube, X, Facebook, Twitch, or Spotify.
          </p>
        </div>
      </div>
    </footer>
  );
}
