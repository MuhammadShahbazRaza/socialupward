"use client";

import {
  siInstagram,
  siYoutube,
  siX,
  siFacebook,
  siTwitch,
  siTiktok,
  siSpotify,
} from "simple-icons";
import { Share2 } from "lucide-react";

/**
 * Maps the `icon` string stored on Platform records to a brand SVG.
 * Brand icons come from simple-icons (lucide no longer ships brand glyphs).
 */
const BRANDS: Record<string, { path: string; title: string }> = {
  instagram: siInstagram,
  youtube: siYoutube,
  twitter: siX,
  facebook: siFacebook,
  twitch: siTwitch,
  "music-2": siTiktok,
  "disc-3": siSpotify,
};

export function PlatformIcon({ name, className }: { name: string; className?: string }) {
  const brand = BRANDS[name];
  if (!brand) {
    return <Share2 className={className} />;
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      role="img"
      aria-label={brand.title}
    >
      <path d={brand.path} />
    </svg>
  );
}
