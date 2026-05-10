"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  HeartPulse,
  Moon,
  Footprints,
  Brain,
  Sparkles,
  Loader2,
  Plug,
} from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { Stat } from "@/components/ui/stat";

type DayPoint = {
  date: string;
  sleep?: { asleepHours: number };
  hrv?: { avgMs: number };
  restingHeartRate?: number;
  steps?: number;
  readiness?: number | null;
};

type Summary = {
  connected: boolean;
  lastIngest: { at: string; metrics: number; samples: number } | null;
  hrvBaselineMs: number | null;
  series: DayPoint[];
};

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

function shortDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

function formatHours(h: number | undefined): string {
  if (h === undefined) return "—";
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

export function RecoveryHealth() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/integrations/apple-health/summary?days=7", {
          cache: "no-store",
        });
        const json = (await res.json()) as Summary;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ connected: false, lastIngest: null, hrvBaselineMs: null, series: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const series = data?.series ?? [];
  const latest = [...series].reverse().find((d) => d.sleep || d.hrv || d.steps);
  const previous = latest
    ? [...series]
        .reverse()
        .find((d, i, arr) => i > arr.indexOf(latest) && (d.sleep || d.hrv))
    : undefined;

  const sleepDelta =
    latest?.sleep && previous?.sleep
      ? Math.round((latest.sleep.asleepHours - previous.sleep.asleepHours) * 60)
      : null;
  const hrvDelta =
    latest?.hrv && previous?.hrv
      ? Math.round(latest.hrv.avgMs - previous.hrv.avgMs)
      : null;

  const stressTone =
    latest?.restingHeartRate !== undefined && data?.hrvBaselineMs
      ? "neutral"
      : "neutral";
  // Stress proxy: resting HR vs 14-day baseline-ish (we have HRV baseline,
  // not RHR baseline yet — keep label simple).
  const stressLabel = latest?.restingHeartRate
    ? `${latest.restingHeartRate} bpm`
    : "—";

  const chartData = series.map((d) => ({
    day: shortDay(d.date),
    readiness: d.readiness ?? null,
    hrv: d.hrv?.avgMs ?? null,
  }));

  const connected = data?.connected ?? false;
  const hasAnyData = series.some((d) => d.sleep || d.hrv || d.steps);

  return (
    <GlassCard glow="emerald" className="p-5">
      <CardHeader
        title="Recovery & Health"
        subtitle={
          connected
            ? data?.lastIngest
              ? `7-day · last sync ${timeAgo(data.lastIngest.at)}`
              : "7-day · no data yet"
            : "Apple Health not connected"
        }
        icon={<HeartPulse className="h-4 w-4 text-neon-emerald" />}
      />

      {loading ? (
        <div className="mt-8 flex items-center justify-center text-[12px] text-muted">
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Loading…
        </div>
      ) : !connected ? (
        <EmptyState
          message="Connect Apple Health from Settings to see real sleep, HRV, and recovery data here."
        />
      ) : !hasAnyData ? (
        <EmptyState message="Connected, but no samples yet. Trigger an export from Health Auto Export on iOS." />
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              label="Sleep"
              value={formatHours(latest?.sleep?.asleepHours)}
              delta={
                sleepDelta !== null
                  ? `${sleepDelta >= 0 ? "+" : ""}${sleepDelta}m`
                  : undefined
              }
              tone={sleepDelta !== null && sleepDelta >= 0 ? "good" : "warn"}
              icon={<Moon className="h-3 w-3" />}
            />
            <Stat
              label="HRV"
              value={latest?.hrv?.avgMs ?? "—"}
              suffix={latest?.hrv ? "ms" : undefined}
              delta={
                hrvDelta !== null
                  ? `${hrvDelta >= 0 ? "+" : ""}${hrvDelta}`
                  : undefined
              }
              tone={hrvDelta !== null && hrvDelta >= 0 ? "good" : "warn"}
              icon={<HeartPulse className="h-3 w-3" />}
            />
            <Stat
              label="Steps"
              value={latest?.steps?.toLocaleString() ?? "—"}
              icon={<Footprints className="h-3 w-3" />}
            />
            <Stat
              label="Resting HR"
              value={stressLabel}
              tone={stressTone}
              icon={<Brain className="h-3 w-3" />}
            />
          </div>

          <div className="mt-5 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
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
                <Area type="monotone" dataKey="readiness" stroke="#34d399" strokeWidth={1.8} fill="url(#readiness)" connectNulls />
                <Area type="monotone" dataKey="hrv" stroke="#5b8cff" strokeWidth={1.6} fill="url(#hrv)" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-lg border border-neon-emerald/20 bg-neon-emerald/[0.06] px-3 py-2 text-[12px] text-subtle">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 text-neon-emerald" />
            <span>
              {readinessNarrative(latest?.readiness ?? null, data?.hrvBaselineMs ?? null)}
            </span>
          </div>
        </>
      )}
    </GlassCard>
  );
}

function readinessNarrative(readiness: number | null, baseline: number | null): React.ReactNode {
  if (readiness === null) {
    return (
      <>
        <span className="text-white">Readiness pending.</span> Once HRV and sleep land, an automatic recovery score will appear here.
      </>
    );
  }
  if (readiness >= 85) {
    return (
      <>
        <span className="text-white">Recovery is strong.</span> Cleared for a heavy session — protect tonight's sleep window to keep the trend.
      </>
    );
  }
  if (readiness >= 70) {
    return (
      <>
        <span className="text-white">Recovery is solid.</span> Plan your hardest cognitive or physical block for the morning.
      </>
    );
  }
  return (
    <>
      <span className="text-white">Recovery is below baseline.</span> Treat today as a deload — lighter training and an earlier bedtime.
      {baseline ? ` 14-day HRV baseline: ${Math.round(baseline)}ms.` : ""}
    </>
  );
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const minutes = Math.round((Date.now() - d.getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.012] p-6 text-center">
      <Plug className="h-5 w-5 text-muted" />
      <p className="max-w-sm text-[12px] text-subtle">{message}</p>
      <Link
        href="/settings"
        className="mt-1 rounded-md border border-neon-emerald/30 bg-neon-emerald/10 px-2.5 py-1 text-[11px] text-white hover:bg-neon-emerald/20"
      >
        Open Settings
      </Link>
    </div>
  );
}
