"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Moon } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { sleepConsistency } from "@/lib/mock-data";

const tooltipStyle = {
  contentStyle: {
    background: "rgba(15,18,24,0.95)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    fontSize: 11,
    color: "#e6e8ee",
  },
} as const;

export function SleepConsistency() {
  return (
    <GlassCard glow="blue" className="p-5">
      <CardHeader
        title="Sleep Consistency"
        subtitle="Bed / wake times · 7 days"
        icon={<Moon className="h-4 w-4 text-neon-blue" />}
      />
      <div className="mt-4 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sleepConsistency} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} domain={[5, 25]} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="bed" stroke="#a78bfa" strokeWidth={1.6} dot={{ r: 2, fill: "#a78bfa" }} />
            <Line type="monotone" dataKey="wake" stroke="#34d399" strokeWidth={1.6} dot={{ r: 2, fill: "#34d399" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-neon-violet" />Bed</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-neon-emerald" />Wake</span>
        <span>±28m variance · 60-day high</span>
      </div>
    </GlassCard>
  );
}
