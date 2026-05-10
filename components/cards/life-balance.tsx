"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Sparkles, Activity } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { lifeBalance } from "@/lib/mock-data";

const tooltipStyle = {
  contentStyle: {
    background: "rgba(15,18,24,0.95)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    fontSize: 11,
    color: "#e6e8ee",
  },
} as const;

export function LifeBalance() {
  return (
    <GlassCard glow="violet" className="p-5">
      <CardHeader
        title="Life Balance"
        subtitle="Demo self-ratings · editable tracking coming soon"
        icon={<Activity className="h-4 w-4 text-neon-violet" />}
      />

      <div className="mt-2 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={lifeBalance} outerRadius="78%">
            <defs>
              <linearGradient id="balance-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5b8cff" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <PolarGrid stroke="rgba(255,255,255,0.07)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: "rgba(230,232,238,0.6)", fontSize: 10 }}
            />
            <Tooltip {...tooltipStyle} />
            <Radar
              name="Target"
              dataKey="target"
              stroke="rgba(255,255,255,0.18)"
              strokeDasharray="3 3"
              fill="rgba(255,255,255,0.03)"
              isAnimationActive
            />
            <Radar
              name="Actual"
              dataKey="value"
              stroke="#a78bfa"
              strokeWidth={1.6}
              fill="url(#balance-fill)"
              isAnimationActive
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-start gap-2 rounded-lg border border-neon-violet/20 bg-neon-violet/[0.06] px-3 py-2 text-[12px] text-subtle">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 text-neon-violet" />
        <span>
          <span className="text-white">Social</span> is 12 pts under target.
          Consider scheduling a low-effort hangout this weekend.
        </span>
      </div>
    </GlassCard>
  );
}
