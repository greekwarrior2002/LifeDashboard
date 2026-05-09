"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Stat({
  label,
  value,
  delta,
  suffix,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string | number;
  delta?: string;
  suffix?: string;
  tone?: "neutral" | "good" | "warn" | "bad";
  icon?: ReactNode;
}) {
  const toneClass = {
    neutral: "text-subtle",
    good: "text-neon-emerald",
    warn: "text-neon-amber",
    bad: "text-neon-rose",
  }[tone];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted">
        {icon}
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="stat-number text-2xl">{value}</span>
        {suffix ? <span className="text-xs text-muted">{suffix}</span> : null}
        {delta ? (
          <span className={cn("text-[11px] font-medium", toneClass)}>{delta}</span>
        ) : null}
      </div>
    </div>
  );
}
