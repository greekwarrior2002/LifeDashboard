"use client";

import Link from "next/link";
import { CalendarDays, CheckCircle2, HeartPulse, PlugZap } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

type Connection = {
  key: string;
  label: string;
  description: string;
  connected: boolean;
  href?: string;
};

const iconMap: Record<string, React.ReactNode> = {
  google: <CalendarDays className="h-3.5 w-3.5" />,
  apple_health: <HeartPulse className="h-3.5 w-3.5" />,
};

export function ConnectionHub({
  connections,
}: {
  connections: Connection[];
}) {
  const connected = connections.filter((item) => item.connected).length;

  return (
    <GlassCard glow="emerald" className="p-5">
      <CardHeader
        title="Workspace Setup"
        subtitle={`${connected}/${connections.length} live integrations`}
        icon={<PlugZap className="h-4 w-4 text-neon-emerald" />}
        right={
          <Link
            href="/settings"
            className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2 py-1.5 text-[11px] text-subtle hover:text-white"
          >
            Settings
          </Link>
        }
      />

      <div className="mt-4 grid gap-2">
        {connections.map((item) => (
          <Link
            key={item.key}
            href={item.href ?? "/settings"}
            className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] px-3 py-2.5 transition-colors hover:border-white/[0.12] hover:bg-white/[0.035]"
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                item.connected
                  ? "border-neon-emerald/25 bg-neon-emerald/10 text-neon-emerald"
                  : "border-white/[0.08] bg-white/[0.03] text-muted",
              )}
            >
              {item.connected ? <CheckCircle2 className="h-3.5 w-3.5" /> : iconMap[item.key]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium text-white">{item.label}</span>
              <span className="block truncate text-[11px] text-muted">{item.description}</span>
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px]",
                item.connected
                  ? "border-neon-emerald/20 bg-neon-emerald/[0.06] text-neon-emerald"
                  : "border-white/[0.08] bg-white/[0.02] text-muted",
              )}
            >
              {item.connected ? "Live" : "Set up"}
            </span>
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}
