"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2, Moon, Plug } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";

type DayPoint = {
  date: string;
  sleep?: { bedTime: number; wakeTime: number };
};

type Summary = {
  connected: boolean;
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
} as const;

function shortDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

// Bed times after midnight (e.g. 0.5 = 00:30) plot better above 24 so the
// line stays smooth across midnight.
function normaliseBedTime(h: number): number {
  if (h < 12) return h + 24;
  return h;
}

function variance(values: number[]): number | null {
  if (values.length < 2) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sqSum = values.reduce((a, b) => a + (b - mean) ** 2, 0);
  return Math.sqrt(sqSum / values.length);
}

export function SleepConsistency() {
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
        if (!cancelled) setData({ connected: false, series: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const series = data?.series ?? [];
  const chartData = series.map((d) => ({
    day: shortDay(d.date),
    bed: d.sleep ? normaliseBedTime(d.sleep.bedTime) : null,
    wake: d.sleep?.wakeTime ?? null,
  }));

  const bedValues = chartData
    .map((d) => d.bed)
    .filter((v): v is number => v !== null);
  const variancePoint = variance(bedValues);
  const varianceLabel =
    variancePoint !== null
      ? `±${Math.round(variancePoint * 60)}m bed-time variance`
      : "Awaiting more samples";

  const connected = data?.connected ?? false;
  const hasAnyData = bedValues.length > 0;

  return (
    <GlassCard glow="blue" className="p-5">
      <CardHeader
        title="Sleep Consistency"
        subtitle="Bed / wake times · 7 days"
        icon={<Moon className="h-4 w-4 text-neon-blue" />}
      />
      {loading ? (
        <div className="mt-8 flex items-center justify-center text-[12px] text-muted">
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Loading…
        </div>
      ) : !connected ? (
        <EmptyState message="Connect Apple Health from Settings to see real bed and wake times here." />
      ) : !hasAnyData ? (
        <EmptyState message="No sleep samples yet — push from Health Auto Export to populate this chart." />
      ) : (
        <>
          <div className="mt-4 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} domain={[5, 30]} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="bed" stroke="#a78bfa" strokeWidth={1.6} dot={{ r: 2, fill: "#a78bfa" }} connectNulls />
                <Line type="monotone" dataKey="wake" stroke="#34d399" strokeWidth={1.6} dot={{ r: 2, fill: "#34d399" }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-neon-violet" />Bed</span>
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-neon-emerald" />Wake</span>
            <span>{varianceLabel}</span>
          </div>
        </>
      )}
    </GlassCard>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.012] p-6 text-center">
      <Plug className="h-5 w-5 text-muted" />
      <p className="max-w-sm text-[12px] text-subtle">{message}</p>
      <Link
        href="/settings"
        className="rounded-md border border-neon-blue/30 bg-neon-blue/10 px-2.5 py-1 text-[11px] text-white hover:bg-neon-blue/20"
      >
        Open Settings
      </Link>
    </div>
  );
}
