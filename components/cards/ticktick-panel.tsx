"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Inbox, ListTodo, ArrowUpRight, Loader2, Plug, SlidersHorizontal } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

type TickTickTask = {
  id: string;
  title: string;
  projectName?: string;
  dueDate?: string;
  priority?: number;
  status?: number;
  tags?: string[];
};

type ApiResponse = {
  connected: boolean;
  tasks: TickTickTask[];
  error?: string;
};

const tabKeys = ["focus", "today", "upcoming", "overdue", "all"] as const;
type TabKey = (typeof tabKeys)[number];

function isToday(d: Date): boolean {
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

function parseTaskDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isWithinDays(d: Date, days: number): boolean {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + days);
  return d >= now && d <= end;
}

function matchesQuery(task: TickTickTask, query: string): boolean {
  const terms = query
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = [
    task.title,
    task.projectName,
    ...(task.tags ?? []),
  ].join(" ").toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

function bucketTasks(tasks: TickTickTask[], focusQuery: string) {
  const now = new Date();
  const open = tasks.filter((t) => t.status !== 2);
  const today: TickTickTask[] = [];
  const overdue: TickTickTask[] = [];
  const upcoming: TickTickTask[] = [];
  const unscheduled: TickTickTask[] = [];
  for (const t of open) {
    const d = parseTaskDate(t.dueDate);
    if (!d) {
      unscheduled.push(t);
      continue;
    }
    if (d < now && !isToday(d)) {
      overdue.push(t);
    } else if (isToday(d)) {
      today.push(t);
    } else if (isWithinDays(d, 14)) {
      upcoming.push(t);
    } else {
      upcoming.push(t);
    }
  }
  const focus = open.filter((t) => {
    const due = parseTaskDate(t.dueDate);
    return matchesQuery(t, focusQuery) && (t.priority === 5 || t.priority === 3 || !due || isWithinDays(due, 14));
  });
  const byDate = (a: TickTickTask, b: TickTickTask) => (parseTaskDate(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER) - (parseTaskDate(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER);
  return {
    focus: focus.sort(byDate),
    today: today.sort(byDate),
    upcoming: upcoming.sort(byDate),
    overdue: overdue.sort(byDate),
    unscheduled,
    all: open.sort(byDate),
  };
}

function dueLabel(t: TickTickTask): string {
  if (!t.dueDate) return "—";
  const d = new Date(t.dueDate);
  if (Number.isNaN(d.getTime())) return "—";
  if (isToday(d)) {
    return `Today · ${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }
  const diffDays = Math.round((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `Overdue · ${Math.abs(diffDays)}d`;
  if (diffDays < 7)
    return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString();
}

function friendlyError(error: string): string {
  if (error.includes("ticktick_reconnect_required")) {
    return "TickTick needs to be reconnected so this app can receive a refresh token.";
  }
  if (error.includes("ticktick_token_refresh_failed")) {
    return "TickTick rejected the saved token. Disconnect and reconnect TickTick from Settings.";
  }
  return "TickTick did not return tasks. Try reconnecting from Settings.";
}

export function TickTickPanel() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<TabKey>("focus");
  const [focusQuery, setFocusQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setFocusQuery(localStorage.getItem("lifeos_ticktick_focus") ?? "");
  }, []);

  useEffect(() => {
    localStorage.setItem("lifeos_ticktick_focus", focusQuery);
  }, [focusQuery]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/integrations/ticktick/tasks", {
          cache: "no-store",
        });
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ connected: false, tasks: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const buckets = useMemo(() => bucketTasks(data?.tasks ?? [], focusQuery), [data, focusQuery]);

  const tabs: Array<{ key: TabKey; label: string; count: number }> = [
    { key: "focus", label: "Focus", count: buckets.focus.length },
    { key: "today", label: "Today", count: buckets.today.length },
    { key: "upcoming", label: "Next", count: buckets.upcoming.length },
    { key: "overdue", label: "Overdue", count: buckets.overdue.length },
    { key: "all", label: "All", count: buckets.all.length },
  ];

  const visible = buckets[active];
  const connected = data?.connected ?? false;
  const error = data?.error;

  return (
    <GlassCard glow="violet" className="flex h-full flex-col p-5">
      <CardHeader
        title="TickTick · Workspace"
        subtitle={
          connected
            ? error
              ? "Connected · needs attention"
              : `Connected · ${buckets.all.length} open`
            : "Not connected"
        }
        icon={<ListTodo className="h-4 w-4 text-neon-violet" />}
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 text-[11px] text-subtle transition-colors hover:text-white"
              aria-label="Tune TickTick focus"
            >
              <SlidersHorizontal className="h-3 w-3" />
            </button>
            <Link
              href="/settings"
              className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 text-[11px] text-subtle transition-colors hover:text-white"
            >
              Manage <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="mt-8 flex flex-1 items-center justify-center text-[12px] text-muted">
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Loading…
        </div>
      ) : !connected ? (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.012] p-6 text-center">
          <Plug className="h-5 w-5 text-muted" />
          <p className="text-[13px] text-white">TickTick isn't connected</p>
          <p className="max-w-xs text-[12px] text-subtle">
            Connect TickTick from Settings to see your real tasks here.
          </p>
          <Link
            href="/settings"
            className="mt-1 rounded-md border border-neon-violet/30 bg-neon-violet/10 px-2.5 py-1 text-[11px] text-white hover:bg-neon-violet/20"
          >
            Open Settings
          </Link>
        </div>
      ) : error ? (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-neon-amber/20 bg-neon-amber/[0.06] p-6 text-center">
          <Plug className="h-5 w-5 text-neon-amber" />
          <p className="text-[13px] text-white">TickTick needs attention</p>
          <p className="max-w-sm text-[12px] text-subtle">{friendlyError(error)}</p>
          <Link
            href="/settings"
            className="mt-1 rounded-md border border-neon-amber/30 bg-neon-amber/10 px-2.5 py-1 text-[11px] text-white hover:bg-neon-amber/20"
          >
            Open Settings
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 flex gap-1 rounded-lg border border-white/[0.05] bg-white/[0.015] p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-[12px] font-medium transition-colors sm:py-1.5",
                  active === t.key ? "text-white" : "text-muted hover:text-subtle",
                )}
              >
                {active === t.key ? (
                  <motion.span
                    layoutId="ticktick-tab"
                    className="absolute inset-0 rounded-md bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                ) : null}
                <span className="relative">{t.label}</span>
                <span
                  className={cn(
                    "relative rounded-full border px-1.5 text-[10px] font-medium",
                    active === t.key
                      ? "border-white/15 bg-white/[0.06] text-subtle"
                      : "border-white/10 bg-white/[0.02] text-muted",
                  )}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
          {settingsOpen ? (
            <label className="mt-2 block rounded-lg border border-white/[0.05] bg-white/[0.015] p-2">
              <span className="text-[10px] uppercase tracking-widest text-muted">Focus keywords</span>
              <input
                value={focusQuery}
                onChange={(e) => setFocusQuery(e.target.value)}
                placeholder="research, thesis, med, urgent"
                className="mt-1 h-8 w-full bg-transparent text-[12px] text-white outline-none placeholder:text-muted"
              />
              <span className="text-[10.5px] text-muted">Comma-separated project, tag, or title terms. Blank shows high priority, no-date, and upcoming tasks.</span>
            </label>
          ) : null}

          <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto pr-1">
            {visible.length === 0 ? (
              <div className="flex h-full items-center justify-center text-[12px] text-muted">
                Nothing here.
              </div>
            ) : (
              visible.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2.5 transition-colors hover:border-white/[0.10] hover:bg-white/[0.04]"
                >
                  <span
                    className={cn(
                      "mt-1 h-4 w-4 shrink-0 rounded-md border transition-all",
                      "border-white/15 bg-white/[0.02] hover:border-neon-emerald hover:bg-neon-emerald/10",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-white">{task.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                      <span className="flex items-center gap-1">
                        <Inbox className="h-3 w-3" />
                        {task.projectName ?? "Inbox"}
                      </span>
                      <span>·</span>
                      <span
                        className={cn(
                          dueLabel(task).toLowerCase().includes("overdue") &&
                            "text-neon-rose",
                        )}
                      >
                        {dueLabel(task)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </GlassCard>
  );
}
