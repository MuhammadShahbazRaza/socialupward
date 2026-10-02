import type { Metadata } from "next";
import { getPlatforms } from "@/lib/catalog";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SocialProofToast } from "@/components/home/social-proof-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SocialUpward — Grow Every Social Platform Faster",
    template: "%s | SocialUpward",
  },
  description:
    "Real-looking followers, engagement and views for Instagram, TikTok, YouTube, X, Facebook, Twitch and Spotify. No passwords, instant delivery, 30-day retention guarantee.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://socialupward.com"),
  openGraph: {
    title: "SocialUpward — Grow Every Social Platform Faster",
    description:
      "Followers, likes, views & live viewers for 7 platforms. No password required. Instant start.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const platforms = await getPlatforms();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://socialupward.vercel.app";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "SocialUpward",
        url: siteUrl,
        description:
          "Creator growth agency: real-looking followers, engagement and views for Instagram, TikTok, YouTube, X, Facebook, Twitch and Spotify.",
        sameAs: [],
      },
      {
        "@type": "WebSite",
        name: "SocialUpward",
        url: siteUrl,
      },
    ],
  };
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-ink-950 text-slate-100 antialiased">
        <Navbar platforms={platforms} />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <SocialProofToast />
      </body>
    </html>
  );
}
