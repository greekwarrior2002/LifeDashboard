"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plug } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";

type ApiEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
};
type ApiResponse = { connected: boolean; events: ApiEvent[] };

function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export function UpNextCard() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/integrations/google/events", {
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
  }, []);

  const upcoming = (data?.events ?? []).filter(
    (e) => new Date(e.end).getTime() > Date.now(),
  );

  return (
    <GlassCard glow="violet" className="p-5">
      <CardHeader
        title="Up Next"
        subtitle={
          !data?.connected
            ? "Not connected"
            : `${upcoming.length} event${upcoming.length === 1 ? "" : "s"} remaining`
        }
      />
      {loading ? (
        <div className="mt-6 flex items-center justify-center text-[12px] text-muted">
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Loading…
        </div>
      ) : !data?.connected ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/[0.08] bg-white/[0.012] p-4 text-center">
          <Plug className="h-5 w-5 text-muted" />
          <p className="text-[12px] text-subtle">
            Connect Google Calendar from Settings.
          </p>
          <Link
            href="/settings"
            className="rounded-md border border-neon-blue/30 bg-neon-blue/10 px-2.5 py-1 text-[11px] text-white hover:bg-neon-blue/20"
          >
            Open Settings
          </Link>
        </div>
      ) : upcoming.length === 0 ? (
        <p className="mt-4 text-[12px] text-muted">Nothing more today.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {upcoming.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2"
            >
              <div>
                <p className="text-[13px] text-white">{e.title}</p>
                {e.location ? (
                  <p className="text-[11px] text-muted">{e.location}</p>
                ) : null}
              </div>
              <span className="font-mono text-[11px] text-subtle">
                {fmtTime(e.start)}
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
