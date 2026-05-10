"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Dot, Loader2, MapPin, Plug } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

type RangeKey = "day" | "week" | "month";
const RANGES: Array<{ key: RangeKey; label: string }> = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

const colorMap: Record<string, { bar: string; dot: string; bg: string }> = {
  blue: { bar: "from-neon-blue to-neon-cyan", dot: "bg-neon-blue", bg: "bg-neon-blue/10" },
  violet: { bar: "from-neon-violet to-neon-blue", dot: "bg-neon-violet", bg: "bg-neon-violet/10" },
  emerald: { bar: "from-neon-emerald to-neon-cyan", dot: "bg-neon-emerald", bg: "bg-neon-emerald/10" },
  amber: { bar: "from-neon-amber to-neon-rose", dot: "bg-neon-amber", bg: "bg-neon-amber/10" },
};

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7am..10pm

const PALETTE: Array<keyof typeof colorMap> = ["blue", "violet", "emerald", "amber"];

type ApiEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  calendarName?: string;
};

type ApiResponse = {
  connected: boolean;
  events: ApiEvent[];
  error?: string;
};

function minutesSinceStart(iso: string, dayStart: Date): number {
  const d = new Date(iso);
  return (d.getTime() - dayStart.getTime()) / 60000;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function getRangeBounds(range: RangeKey) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  if (range === "day") end.setDate(end.getDate() + 1);
  else if (range === "week") end.setDate(end.getDate() + 7);
  else end.setMonth(end.getMonth() + 1);
  return { start, end };
}

function eventsUrl(range: RangeKey): string {
  const { start, end } = getRangeBounds(range);
  const params = new URLSearchParams({
    from: start.toISOString(),
    to: end.toISOString(),
  });
  return `/api/integrations/google/events?${params.toString()}`;
}

export function CalendarTimeline() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("day");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(eventsUrl(range), {
          cache: "no-store",
        });
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ connected: false, events: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [range]);

  const startMin = 7 * 60;
  const endMin = 23 * 60;
  const total = endMin - startMin;

  const dayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const nowMin = (() => {
    if (typeof window === "undefined") return 11 * 60 + 12;
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  })();

  const events = data?.events ?? [];
  const connected = data?.connected ?? false;

  const subtitle = !connected
    ? "Google Calendar - not connected"
    : data?.error
      ? "Google Calendar - unable to load events"
      : `Google Calendar · ${events.length} ${events.length === 1 ? "event" : "events"}`;

  return (
    <GlassCard glow="blue" className="p-5">
      <CardHeader
        title="Calendar · Today"
        subtitle={subtitle}
        icon={<CalendarIcon className="h-4 w-4 text-neon-blue" />}
        right={
          <div className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] p-0.5 text-[11px]">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={cn(
                  "rounded px-2 py-1.5 transition-colors sm:py-0.5",
                  range === r.key
                    ? "bg-white/[0.06] text-white"
                    : "text-muted hover:text-white",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <div className="mt-8 flex h-[440px] items-center justify-center text-[12px] text-muted">
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Loading...
        </div>
      ) : !connected ? (
        <EmptyState
          title="Google Calendar isn't connected"
          body="Connect it from Settings to see your events here."
        />
      ) : data?.error ? (
        <EmptyState title="Calendar events couldn't load" body={data.error} />
      ) : events.length === 0 ? (
        <EmptyState
          title={
            range === "day"
              ? "Nothing scheduled today"
              : range === "week"
                ? "Nothing scheduled this week"
                : "Nothing scheduled this month"
          }
          body="No events came back from Google for this range."
        />
      ) : range !== "day" ? (
        <EventList events={events} />
      ) : (
        <div className="mt-5 grid grid-cols-[36px_1fr] gap-2 sm:grid-cols-[48px_1fr] sm:gap-3">
          {/* Hour rail */}
          <div className="relative h-[440px]">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 -translate-y-1/2 text-right text-[10px] font-mono text-muted"
                style={{ top: `${((h * 60 - startMin) / total) * 100}%` }}
              >
                {h.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>

          <div className="relative h-[440px] overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.012]">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 h-px bg-white/[0.04]"
                style={{ top: `${((h * 60 - startMin) / total) * 100}%` }}
              />
            ))}

            {nowMin > startMin && nowMin < endMin ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute left-0 right-0 z-10"
                style={{ top: `${((nowMin - startMin) / total) * 100}%` }}
              >
                <div className="relative">
                  <div className="h-px w-full bg-gradient-to-r from-neon-blue via-neon-violet to-transparent shadow-[0_0_12px_rgba(91,140,255,0.6)]" />
                  <div className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-neon-blue shadow-[0_0_10px_rgba(91,140,255,0.9)]" />
                </div>
              </motion.div>
            ) : null}

            {events.map((e, i) => {
              const startMinAbs = minutesSinceStart(e.start, dayStart);
              const endMinAbs = minutesSinceStart(e.end, dayStart);
              if (endMinAbs < startMin || startMinAbs > endMin) return null;
              const top = ((Math.max(startMinAbs, startMin) - startMin) / total) * 100;
              const height =
                ((Math.min(endMinAbs, endMin) - Math.max(startMinAbs, startMin)) /
                  total) *
                100;
              const tone = colorMap[PALETTE[i % PALETTE.length]];
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                  className={cn(
                    "group absolute left-2 right-2 cursor-pointer overflow-hidden rounded-lg border border-white/[0.06] backdrop-blur-md transition-all hover:border-white/[0.16] hover:scale-[1.005]",
                    tone.bg,
                  )}
                  style={{ top: `${top}%`, height: `calc(${Math.max(height, 4)}% - 2px)` }}
                >
                  <div
                    className={cn(
                      "absolute inset-y-1 left-1 w-[3px] rounded-full bg-gradient-to-b",
                      tone.bar,
                    )}
                  />
                  <div className="px-3 py-2">
                    <p className="text-[12px] font-medium text-white">{e.title}</p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-muted">
                      <span className="font-mono">
                        {fmtTime(e.start)}-{fmtTime(e.end)}
                      </span>
                      {e.location ? (
                        <>
                          <Dot className="h-3 w-3" />
                          <MapPin className="h-3 w-3" />
                          <span>{e.location}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function EventList({ events }: { events: ApiEvent[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, ApiEvent[]>();
    for (const e of events) {
      const d = new Date(e.start);
      const key = d.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: new Date(key).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      items,
    }));
  }, [events]);

  return (
    <div className="mt-5 max-h-[440px] space-y-3 overflow-y-auto pr-1">
      {groups.map((g) => (
        <div key={g.key}>
          <p className="px-1 pb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            {g.label}
          </p>
          <div className="space-y-1.5">
            {g.items.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2"
              >
                <span className="font-mono text-[11px] text-subtle">
                  {fmtTime(e.start)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-white">{e.title}</p>
                  <p className="truncate text-[11px] text-muted">
                    {[e.calendarName, e.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-6 flex h-[400px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.012] p-6 text-center">
      <Plug className="h-5 w-5 text-muted" />
      <p className="text-[13px] text-white">{title}</p>
      <p className="max-w-xs break-words text-[12px] text-subtle">{body}</p>
      <Link
        href="/settings"
        className="mt-1 rounded-md border border-neon-blue/30 bg-neon-blue/10 px-2.5 py-1 text-[11px] text-white hover:bg-neon-blue/20"
      >
        Open Settings
      </Link>
    </div>
  );
}
