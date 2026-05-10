"use client";

import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, TrendingUp, CircleCheck } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { aiInsights } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const toneMap = {
  warning: { Icon: AlertTriangle, bg: "border-neon-amber/20 bg-neon-amber/[0.06]", color: "text-neon-amber" },
  info: { Icon: TrendingUp, bg: "border-neon-blue/20 bg-neon-blue/[0.06]", color: "text-neon-blue" },
  good: { Icon: CircleCheck, bg: "border-neon-emerald/20 bg-neon-emerald/[0.06]", color: "text-neon-emerald" },
} as const;

export function AIInsights() {
  return (
    <GlassCard glow="blue" className="p-5">
      <CardHeader
        title="AI Insights"
        subtitle="Demo insights · automation coming soon"
        icon={<Sparkles className="h-4 w-4 text-neon-blue" />}
      />

      <div className="mt-4 space-y-2">
        {aiInsights.map((a, i) => {
          const t = toneMap[a.tone as keyof typeof toneMap];
          const I = t.Icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn("flex items-start gap-3 rounded-xl border p-3", t.bg)}
            >
              <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03]", t.color)}>
                <I className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-white">{a.title}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-subtle">{a.body}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
