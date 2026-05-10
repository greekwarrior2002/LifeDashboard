"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Car, Wrench, Gauge, ChevronRight } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { cars } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const accent: Record<string, { ring: string; bar: string; glow: string }> = {
  blue: { ring: "ring-neon-blue/30", bar: "from-neon-blue to-neon-cyan", glow: "shadow-glow" },
  violet: { ring: "ring-neon-violet/30", bar: "from-neon-violet to-neon-blue", glow: "shadow-glow-violet" },
};

export function CarDashboard() {
  return (
    <GlassCard glow="amber" className="p-5">
      <CardHeader
        title="Garage"
        subtitle="2 vehicles · maintenance & logs"
        icon={<Car className="h-4 w-4 text-neon-amber" />}
        right={
          <Link
            href="/cars"
            className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 text-[11px] text-subtle transition-colors hover:text-white"
          >
            Service log <ChevronRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {cars.map((c, i) => {
          const tone = accent[c.color] ?? accent.blue;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-white/[0.05] bg-gradient-to-br from-white/[0.025] to-transparent p-4 ring-1",
                tone.ring,
              )}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/[0.04] blur-3xl" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted">{c.nickname}</p>
                  <p className="mt-1 text-[15px] font-semibold text-white">{c.name}</p>
                </div>
                <div className={cn("rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[10px] text-subtle", tone.glow)}>
                  Health {c.health}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-[11px]">
                <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-2.5">
                  <div className="flex items-center gap-1 text-muted">
                    <Gauge className="h-3 w-3" /> Mileage
                  </div>
                  <p className="mt-1 font-mono text-[13px] text-white">{c.mileage.toLocaleString()} km</p>
                </div>
                <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-2.5">
                  <div className="flex items-center gap-1 text-muted">
                    <Wrench className="h-3 w-3" /> Next
                  </div>
                  <p className="mt-1 truncate text-[12px] text-white">{c.nextService}</p>
                </div>
                <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-2.5">
                  <div className="text-muted">In</div>
                  <p className="mt-1 font-mono text-[13px] text-white">{c.serviceIn} km</p>
                </div>
              </div>

              {/* health bar */}
              <div className="mt-4">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.health}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className={cn("h-full rounded-full bg-gradient-to-r", tone.bar)}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-1">
                {c.log.slice(0, 3).map((l, j) => (
                  <div key={j} className="flex items-center justify-between rounded-md border border-white/[0.04] bg-white/[0.012] px-2 py-1.5 text-[11px]">
                    <span className="text-muted">{l.date}</span>
                    <span className="flex-1 px-2 text-subtle">{l.item}</span>
                    <span className="font-mono text-white">${l.cost}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
