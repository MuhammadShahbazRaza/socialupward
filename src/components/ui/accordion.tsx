"use client";

import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./cn";

export function Accordion({
  items,
  className,
}: {
  items: { title: string; content: ReactNode }[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className={cn("divide-y divide-white/10 rounded-2xl border border-white/10 bg-ink-800/60", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left cursor-pointer"
            >
              <span className="font-medium text-white">{item.title}</span>
              <ChevronDown
                className={cn("h-5 w-5 shrink-0 text-indigo-300 transition-transform", isOpen && "rotate-180")}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-5 text-sm leading-relaxed text-slate-400">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
