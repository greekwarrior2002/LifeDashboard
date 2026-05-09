"use client";

import { motion } from "framer-motion";
import { Sun, Moon, Activity, Brain, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";

export function MorningBriefing() {
  return (
    <GlassCard glow="violet" className="relative overflow-hidden p-6 lg:p-7">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-neon-violet/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 bottom-0 h-48 w-48 rounded-full bg-neon-blue/10 blur-3xl" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-neon-amber" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
              Morning briefing · Friday, May 9
            </span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            Good morning, <span className="shimmer-text">Damian</span>.
          </motion.h1>
          <p className="max-w-lg text-[14px] leading-relaxed text-subtle">
            You slept <span className="text-white">7h 36m</span>, recovery is{" "}
            <span className="text-neon-emerald">high</span>, and your calendar is balanced.
            Today is ideal for <span className="text-white">deep cognitive work</span> —
            protect the 10:15–12:15 block for thesis Methods.
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="chip">
              <Sparkles className="h-3 w-3 text-neon-blue" /> AI suggested focus
            </span>
            <span className="chip">12°C · Clear · Light wind</span>
            <span className="chip">3 deadlines this week</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5 lg:gap-6">
          <RingTile value={86} tone="emerald" label="Sleep" sub="7h 36m" icon={<Moon className="h-3 w-3" />} />
          <RingTile value={78} tone="blue" label="Recovery" sub="HRV 70" icon={<Activity className="h-3 w-3" />} />
          <RingTile value={92} tone="violet" label="Focus" sub="Peak window" icon={<Brain className="h-3 w-3" />} />
        </div>
      </div>
    </GlassCard>
  );
}

function RingTile({
  value,
  tone,
  label,
  sub,
  icon,
}: {
  value: number;
  tone: "blue" | "violet" | "emerald" | "amber" | "rose";
  label: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <ProgressRing value={value} tone={tone} size={92} stroke={8} />
      <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-muted">
        {icon}
        {label}
      </div>
      <span className="text-[11px] text-subtle">{sub}</span>
    </div>
  );
}
