"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HeartPulse, Moon, Coffee, Brain, Sparkles } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { Stat } from "@/components/ui/stat";
import { recoveryTrend } from "@/lib/mock-data";

const tooltipStyle = {
  contentStyle: {
    background: "rgba(15,18,24,0.95)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    fontSize: 11,
    color: "#e6e8ee",
  },
  labelStyle: { color: "rgba(230,232,238,0.55)" },
} as const;

export function RecoveryHealth() {
  return (
    <GlassCard glow="emerald" className="p-5">
      <CardHeader
        title="Recovery & Health"
        subtitle="7-day rolling · Apple Health ready"
        icon={<HeartPulse className="h-4 w-4 text-neon-emerald" />}
      />

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Sleep" value="7h 36m" delta="+12m" tone="good" icon={<Moon className="h-3 w-3" />} />
        <Stat label="HRV" value={70} suffix="ms" delta="+5" tone="good" icon={<HeartPulse className="h-3 w-3" />} />
        <Stat label="Caffeine" value="180" suffix="mg" delta="-40" tone="good" icon={<Coffee className="h-3 w-3" />} />
        <Stat label="Stress" value="Low" tone="good" icon={<Brain className="h-3 w-3" />} />
      </div>

      <div className="mt-5 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={recoveryTrend} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="readiness" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="hrv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5b8cff" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#5b8cff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="readiness" stroke="#34d399" strokeWidth={1.8} fill="url(#readiness)" />
            <Area type="monotone" dataKey="hrv" stroke="#5b8cff" strokeWidth={1.6} fill="url(#hrv)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-neon-emerald/20 bg-neon-emerald/[0.06] px-3 py-2 text-[12px] text-subtle">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 text-neon-emerald" />
        <span>
          <span className="text-white">Recovery trending up.</span> You're cleared for a heavy push session — but cap caffeine after 14:00 to protect tonight's sleep window.
        </span>
      </div>
    </GlassCard>
  );
}
