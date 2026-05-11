"use client";

import Link from "next/link";
import { Home, Lightbulb, ShieldCheck, ThermometerSun } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";

const areas = [
  { label: "Lights", detail: "Scenes and room state", icon: <Lightbulb className="h-3.5 w-3.5" /> },
  { label: "Climate", detail: "Temperature and comfort", icon: <ThermometerSun className="h-3.5 w-3.5" /> },
  { label: "Security", detail: "Locks, doors, motion", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
];

export function HomeAutomationCard() {
  return (
    <GlassCard glow="amber" className="p-5">
      <CardHeader
        title="Home Automation"
        subtitle="Best path: Home Assistant bridge"
        icon={<Home className="h-4 w-4 text-neon-amber" />}
      />

      <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {areas.map((area) => (
          <div
            key={area.label}
            className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3"
          >
            <div className="flex items-center gap-2 text-[12px] font-medium text-white">
              <span className="text-neon-amber">{area.icon}</span>
              {area.label}
            </div>
            <p className="mt-1 text-[11px] text-muted">{area.detail}</p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-subtle">
        A web dashboard cannot directly read Apple HomeKit. Home Assistant can
        pair HomeKit devices locally, then expose a REST API this app can read.
      </p>
      <Link
        href="/settings"
        className="mt-3 inline-flex rounded-md border border-neon-amber/25 bg-neon-amber/10 px-2.5 py-1.5 text-[11px] text-white hover:bg-neon-amber/20"
      >
        Plan integration
      </Link>
    </GlassCard>
  );
}
