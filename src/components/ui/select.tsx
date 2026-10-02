import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "./cn";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500/60 cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";
