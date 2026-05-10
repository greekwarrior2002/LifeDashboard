"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Inbox, ListTodo, ArrowUpRight, Loader2, Plug } from "lucide-react";
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

const tabKeys = ["today", "overdue", "inbox", "all"] as const;
type TabKey = (typeof tabKeys)[number];

function isToday(d: Date): boolean {
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

function bucketTasks(tasks: TickTickTask[]) {
  const now = new Date();
  const open = tasks.filter((t) => t.status !== 2);
  const today: TickTickTask[] = [];
  const overdue: TickTickTask[] = [];
  const inbox: TickTickTask[] = [];
  for (const t of open) {
    if (!t.dueDate) {
      inbox.push(t);
      continue;
    }
    const d = new Date(t.dueDate);
    if (Number.isNaN(d.getTime())) {
      inbox.push(t);
    } else if (d < now && !isToday(d)) {
      overdue.push(t);
    } else if (isToday(d)) {
      today.push(t);
    } else {
      inbox.push(t);
    }
  }
  return { today, overdue, inbox, all: open };
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

export function TickTickPanel() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<TabKey>("today");

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

  const buckets = useMemo(() => bucketTasks(data?.tasks ?? []), [data]);

  const tabs: Array<{ key: TabKey; label: string; count: number }> = [
    { key: "today", label: "Today", count: buckets.today.length },
    { key: "overdue", label: "Overdue", count: buckets.overdue.length },
    { key: "inbox", label: "Inbox", count: buckets.inbox.length },
    { key: "all", label: "All", count: buckets.all.length },
  ];

  const visible = buckets[active];
  const connected = data?.connected ?? false;

  return (
    <GlassCard glow="violet" className="flex h-full flex-col p-5">
      <CardHeader
        title="TickTick · Workspace"
        subtitle={
          connected
            ? `Connected · ${buckets.all.length} open`
            : "Not connected"
        }
        icon={<ListTodo className="h-4 w-4 text-neon-violet" />}
        right={
          <Link
            href="/settings"
            className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 text-[11px] text-subtle transition-colors hover:text-white"
          >
            Manage <ArrowUpRight className="h-3 w-3" />
          </Link>
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
