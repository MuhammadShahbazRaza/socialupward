"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, X, BadgeCheck } from "lucide-react";
import { PlatformIcon } from "../platform-icon";
const NAMES = [
  "Liam", "Emma", "Noah", "Olivia", "Ethan", "Ava", "Lucas", "Mia", "Mason", "Sofia",
  "James", "Isabella", "Benjamin", "Amara", "Elijah", "Zoe", "Daniel", "Priya", "Omar", "Yuki",
];
const CITIES = [
  "New York", "London", "Lahore", "Dubai", "Toronto", "Sydney", "Berlin", "Mumbai",
  "Los Angeles", "Amsterdam", "Singapore", "Cairo", "Austin", "Paris", "Jakarta",
];
const PRODUCTS = [
  { icon: "instagram", label: "Instagram Followers" },
  { icon: "instagram", label: "Instagram Reels Views" },
  { icon: "music-2", label: "TikTok Followers" },
  { icon: "music-2", label: "TikTok Likes" },
  { icon: "youtube", label: "YouTube Subscribers" },
  { icon: "youtube", label: "YouTube Views" },
  { icon: "twitter", label: "X Followers" },
  { icon: "facebook", label: "Facebook Page Likes" },
  { icon: "twitch", label: "Twitch Live Viewers" },
  { icon: "disc-3", label: "Spotify Streams" },
];
const QUANTITIES = ["1,000", "2,500", "5,000", "10,000", "25,000", "500"];

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Live social-proof toast: "Someone from X just ordered Y". */
export function SocialProofToast() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({
    name: "",
    city: "",
    product: PRODUCTS[0],
    qty: "",
    minutesAgo: 2,
  });
  const [key, setKey] = useState(0);

  useEffect(() => {
    let showTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    const cycle = () => {
      setData({
        name: randomOf(NAMES),
        city: randomOf(CITIES),
        product: randomOf(PRODUCTS),
        qty: randomOf(QUANTITIES),
        minutesAgo: Math.floor(Math.random() * 50) + 2,
      });
      setKey((k) => k + 1);
      setVisible(true);
      hideTimer = setTimeout(() => {
        setVisible(false);
        showTimer = setTimeout(cycle, 9000 + Math.random() * 8000);
      }, 5000);
    };

    showTimer = setTimeout(cycle, 4000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      key={key}
      className="animate-toast-in fixed bottom-5 left-5 z-[70] flex max-w-xs items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/95 p-3.5 pr-9 shadow-2xl backdrop-blur-xl"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
        <PlatformIcon name={data.product.icon} className="h-5 w-5" />
      </span>
      <div className="text-xs leading-snug">
        <p className="font-semibold text-white">
          {data.name} from {data.city}
        </p>
        <p className="text-slate-400">
          just ordered {data.qty} {data.product.label}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-emerald-400">
          <BadgeCheck className="h-3 w-3" /> Verified order · {data.minutesAgo} min ago
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-2 top-2 rounded-full p-1 text-slate-500 hover:text-white cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <ShoppingBag className="sr-only" />
    </div>
  );
}
