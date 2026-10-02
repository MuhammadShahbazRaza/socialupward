"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "./cn";

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}

export function Slider({ value, min, max, step = 1, onChange, className, ...props }: SliderProps) {
  // Fill percentage is derived directly from props — no state/effect needed.
  const fill = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      className={cn("slider w-full", className)}
      style={{ ["--fill" as string]: `${fill}%` }}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      {...props}
    />
  );
}
