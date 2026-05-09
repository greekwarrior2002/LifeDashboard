"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tone = "blue" | "violet" | "emerald" | "amber" | "rose";

const toneStops: Record<Tone, { from: string; to: string; glow: string }> = {
  blue: { from: "#5b8cff", to: "#22d3ee", glow: "rgba(91,140,255,0.45)" },
  violet: { from: "#a78bfa", to: "#5b8cff", glow: "rgba(167,139,250,0.45)" },
  emerald: { from: "#34d399", to: "#22d3ee", glow: "rgba(52,211,153,0.45)" },
  amber: { from: "#fbbf24", to: "#fb7185", glow: "rgba(251,191,36,0.45)" },
  rose: { from: "#fb7185", to: "#a78bfa", glow: "rgba(251,113,133,0.45)" },
};

export function ProgressRing({
  value,
  size = 88,
  stroke = 8,
  tone = "blue",
  label,
  sub,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: Tone;
  label?: string;
  sub?: string;
  className?: string;
}) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circ * (1 - pct / 100);
  const id = `pr-${tone}-${size}`;
  const stops = toneStops[tone];

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={stops.from} />
            <stop offset="100%" stopColor={stops.to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${stops.glow})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="stat-number text-xl">{Math.round(pct)}</span>
        {label ? <span className="text-[10px] uppercase tracking-widest text-muted">{label}</span> : null}
        {sub ? <span className="mt-0.5 text-[10px] text-muted">{sub}</span> : null}
      </div>
    </div>
  );
}
