"use client";

import { motion } from "framer-motion";
import { Clock, GraduationCap, Award, FlaskConical, Plane, Target, BookOpen } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { lifeMilestones } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const kindIcon: Record<string, React.ElementType> = {
  academic: GraduationCap,
  conference: BookOpen,
  achievement: Award,
  research: FlaskConical,
  trip: Plane,
  application: GraduationCap,
  goal: Target,
};
const kindTone: Record<string, string> = {
  academic: "from-neon-blue to-neon-cyan",
  conference: "from-neon-violet to-neon-blue",
  achievement: "from-neon-amber to-neon-rose",
  research: "from-neon-violet to-neon-blue",
  trip: "from-neon-emerald to-neon-cyan",
  application: "from-neon-blue to-neon-violet",
  goal: "from-neon-rose to-neon-violet",
};

export function LifeTimeline() {
  return (
    <GlassCard glow="violet" className="p-5">
      <CardHeader
        title="Life Timeline"
        subtitle="Milestones · publications · goals"
        icon={<Clock className="h-4 w-4 text-neon-blue" />}
      />

      <div className="mt-5 overflow-x-auto pb-2">
        <div className="relative min-w-[800px]">
          {/* spine */}
          <div className="absolute left-0 right-0 top-7 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="grid grid-cols-9 gap-4">
            {lifeMilestones.map((m, i) => {
              const Icon = kindIcon[m.kind] ?? Clock;
              const tone = kindTone[m.kind] ?? "from-neon-blue to-neon-violet";
              const above = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative flex flex-col items-center"
                >
                  <div className={cn("order-2 mt-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.10] bg-ink-900 shadow-glow")}>
                    <div className={cn("h-3 w-3 rounded-full bg-gradient-to-br", tone)} />
                  </div>
                  <div
                    className={cn(
                      "w-full rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-[11px] backdrop-blur-md",
                      above ? "order-1" : "order-3 mt-2",
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-muted">
                      <Icon className="h-3 w-3" />
                      {m.date}
                    </div>
                    <p className="mt-1 text-[12px] font-medium text-white">{m.title}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
