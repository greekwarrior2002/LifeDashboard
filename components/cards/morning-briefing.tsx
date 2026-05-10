"use client";

import { motion } from "framer-motion";
import { Sun, Moon, Activity, Brain, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useUser } from "@/lib/hooks/use-user";

function greeting(now: Date): string {
  const h = now.getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Late night";
}

export function MorningBriefing() {
  const { user } = useUser();
  const now = new Date();
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const sleepTarget = user?.health.sleepTargetHours ?? 8;
  const recoveryGoal = user?.health.recoveryGoal ?? 80;

  return (
    <GlassCard glow="violet" className="relative overflow-hidden p-5 sm:p-6 lg:p-7">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-neon-violet/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 bottom-0 h-48 w-48 rounded-full bg-neon-blue/10 blur-3xl" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-neon-amber" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
              Briefing · {dateLabel}
            </span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            {greeting(now)},{" "}
            <span className="shimmer-text">
              {user?.profile.name?.split(" ")[0] || "friend"}
            </span>
            .
          </motion.h1>
          <p className="max-w-lg text-[14px] leading-relaxed text-subtle">
            {user?.profile.program ? (
              <>
                Your <span className="text-white">{user.profile.program}</span>{" "}
                day is queued.{" "}
              </>
            ) : null}
            Sleep target{" "}
            <span className="text-white">{sleepTarget.toFixed(1)}h</span>,
            recovery goal{" "}
            <span className="text-neon-emerald">{recoveryGoal}</span>.
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="chip">
              <Sparkles className="h-3 w-3 text-neon-blue" /> Personalized briefing
            </span>
            {user?.profile.cycle ? (
              <span className="chip">{user.profile.cycle}</span>
            ) : null}
            {user?.profile.timezone ? (
              <span className="chip">{user.profile.timezone}</span>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-5 lg:gap-6">
          <RingTile
            value={Math.min(100, Math.round((sleepTarget / 9) * 100))}
            tone="emerald"
            label="Sleep"
            sub={`${sleepTarget.toFixed(1)}h goal`}
            icon={<Moon className="h-3 w-3" />}
          />
          <RingTile
            value={recoveryGoal}
            tone="blue"
            label="Recovery"
            sub="goal"
            icon={<Activity className="h-3 w-3" />}
          />
          <RingTile
            value={user?.goals.priorities.length ? 100 : 0}
            tone="violet"
            label="Focus"
            sub={`${user?.goals.priorities.length ?? 0} priorities`}
            icon={<Brain className="h-3 w-3" />}
          />
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
      <div className="origin-center scale-75 sm:scale-100">
        <ProgressRing value={value} tone={tone} size={92} stroke={8} />
      </div>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-muted sm:text-[11px]">
        {icon}
        {label}
      </div>
      <span className="text-[10px] text-subtle sm:text-[11px]">{sub}</span>
    </div>
  );
}
