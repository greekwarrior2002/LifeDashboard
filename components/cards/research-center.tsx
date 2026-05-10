"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FlaskConical, ChevronRight, Calendar } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { researchProjects } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  blue: "from-neon-blue to-neon-cyan",
  violet: "from-neon-violet to-neon-blue",
  emerald: "from-neon-emerald to-neon-cyan",
};

export function ResearchCenter() {
  return (
    <GlassCard glow="violet" className="p-5">
      <CardHeader
        title="Research Command Center"
        subtitle="Demo project tracker · editable store coming soon"
        icon={<FlaskConical className="h-4 w-4 text-neon-violet" />}
        right={
          <Link
            href="/research"
            className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 text-[11px] text-subtle transition-colors hover:text-white"
          >
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="mt-4 space-y-3">
        {researchProjects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4 transition-colors hover:border-white/[0.10]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[14px] font-medium text-white">{p.title}</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {p.phase} · <span className="text-subtle">{p.nextMilestone}</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <Calendar className="h-3 w-3" />
                {p.deadline}
              </div>
            </div>

            {/* progress bar */}
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${p.progress}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "h-full rounded-full bg-gradient-to-r shadow-glow",
                  tone[p.color] ?? tone.blue,
                )}
              />
            </div>

            {/* pipeline */}
            <div className="mt-3 flex items-center gap-1.5">
              {p.pipeline.map((step, idx) => (
                <div key={idx} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex w-full items-center gap-1">
                    <div
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        step.done
                          ? "bg-gradient-to-r from-neon-emerald to-neon-cyan"
                          : step.current
                            ? "bg-gradient-to-r from-neon-blue to-neon-violet animate-pulseGlow"
                            : "bg-white/[0.05]",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "hidden truncate text-[10px] tracking-wide sm:inline",
                      step.current
                        ? "text-white"
                        : step.done
                          ? "text-subtle"
                          : "text-muted",
                    )}
                  >
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
