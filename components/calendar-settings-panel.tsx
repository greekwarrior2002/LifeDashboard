"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type CalendarInfo = {
  id: string;
  summary: string;
  backgroundColor?: string;
  foregroundColor?: string;
  hidden?: boolean;
  selected?: boolean;
  accessRole?: string;
};

type CalendarResponse = {
  connected: boolean;
  calendars: CalendarInfo[];
  selectedCalendarIds: string[] | null;
  error?: string;
};

export function CalendarSettingsPanel({ connected }: { connected: boolean }) {
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const refresh = useCallback(async () => {
    if (!connected) return;
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/integrations/google/calendars", {
        cache: "no-store",
      });
      const json = (await res.json()) as CalendarResponse;
      setData(json);
      setSelected(new Set(json.selectedCalendarIds ?? []));
    } finally {
      setLoading(false);
    }
  }, [connected]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function save(next: Set<string>) {
    setSelected(next);
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/integrations/google/calendars", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedCalendarIds: Array.from(next) }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!connected) return null;

  return (
    <div className="mt-3 rounded-lg border border-white/[0.05] bg-white/[0.015] p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] text-white">Calendar visibility</p>
          <p className="text-[11px] text-muted">
            Choose which Google calendars appear on the dashboard.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="flex h-8 items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 text-[11px] text-subtle hover:text-white disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refresh
        </button>
      </div>

      {data?.error ? (
        <p className="mt-3 rounded-md border border-neon-rose/30 bg-neon-rose/10 px-2 py-1.5 text-[11px] text-neon-rose">
          {data.error}
        </p>
      ) : null}

      <div className="mt-3 space-y-1.5">
        {loading && !data ? (
          <p className="text-[12px] text-muted">Loading calendars...</p>
        ) : null}
        {data?.calendars.map((calendar) => {
          const checked = selected.has(calendar.id);
          return (
            <label
              key={calendar.id}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-md border px-2 py-2 transition",
                checked
                  ? "border-neon-blue/30 bg-neon-blue/10"
                  : "border-white/[0.05] bg-white/[0.012] hover:bg-white/[0.025]",
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full border border-white/20"
                  style={{ backgroundColor: calendar.backgroundColor ?? "#5b8cff" }}
                />
                <span className="min-w-0">
                  <span className="block truncate text-[12px] text-white">
                    {calendar.summary}
                  </span>
                  <span className="block truncate text-[10px] text-muted">
                    {calendar.accessRole ?? "calendar"}
                  </span>
                </span>
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-neon-blue"
                checked={checked}
                onChange={() => {
                  const next = new Set(selected);
                  if (next.has(calendar.id)) next.delete(calendar.id);
                  else next.add(calendar.id);
                  void save(next);
                }}
              />
            </label>
          );
        })}
        {data && data.calendars.length === 0 ? (
          <p className="rounded-md border border-dashed border-white/[0.08] px-2 py-3 text-center text-[12px] text-muted">
            No calendars were returned by Google.
          </p>
        ) : null}
      </div>
      <div className="mt-2 flex h-4 items-center justify-end text-[10px] text-muted">
        {saving ? "Saving..." : saved ? <span className="flex items-center gap-1 text-neon-emerald"><Check className="h-3 w-3" /> Saved</span> : null}
      </div>
    </div>
  );
}
