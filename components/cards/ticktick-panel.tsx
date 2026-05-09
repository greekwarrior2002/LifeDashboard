"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Inbox, ListTodo, AlertTriangle, Sparkles, ArrowUpRight } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { tickTickInbox } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "today", label: "Today", count: 6 },
  { key: "overdue", label: "Overdue", count: 1 },
  { key: "inbox", label: "Inbox", count: 5 },
  { key: "projects", label: "Projects", count: 8 },
];

const tagTone: Record<string, string> = {
  email: "border-neon-blue/30 bg-neon-blue/10 text-neon-blue",
  abstract: "border-neon-violet/30 bg-neon-violet/10 text-neon-violet",
  car: "border-neon-amber/30 bg-neon-amber/10 text-neon-amber",
  read: "border-white/10 bg-white/[0.04] text-subtle",
  personal: "border-neon-emerald/30 bg-neon-emerald/10 text-neon-emerald",
};

export function TickTickPanel() {
  const [active, setActive] = useState("inbox");

  return (
    <GlassCard glow="violet" className="flex h-full flex-col p-5">
      <CardHeader
        title="TickTick · Workspace"
        subtitle="Connected · synced 2 min ago"
        icon={<ListTodo className="h-4 w-4 text-neon-violet" />}
        right={
          <button className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 text-[11px] text-subtle transition-colors hover:text-white">
            Open <ArrowUpRight className="h-3 w-3" />
          </button>
        }
      />

      <div className="mt-4 flex gap-1 rounded-lg border border-white/[0.05] bg-white/[0.015] p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors",
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

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-neon-amber/20 bg-neon-amber/[0.06] px-3 py-2 text-[12px] text-subtle">
        <AlertTriangle className="h-3.5 w-3.5 text-neon-amber" />
        Workload <span className="text-white">slightly high</span> — 7.5h estimated, 6.5h available.
      </div>

      <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {tickTickInbox.map((task, i) => (
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
                  {task.project}
                </span>
                <span>·</span>
                <span
                  className={cn(
                    task.due.toLowerCase().includes("overdue") && "text-neon-rose",
                  )}
                >
                  {task.due}
                </span>
                {task.tags.map((t) => (
                  <span
                    key={t}
                    className={cn(
                      "rounded border px-1 py-px text-[10px]",
                      tagTone[t] ?? "border-white/10 bg-white/[0.04] text-subtle",
                    )}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[12px]">
        <div className="flex items-center gap-2 text-subtle">
          <Sparkles className="h-3.5 w-3.5 text-neon-blue" />
          <span>Suggest: Schedule "Submit abstract" tomorrow 09:00</span>
        </div>
        <button className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white hover:bg-white/[0.08]">
          Accept
        </button>
      </div>
    </GlassCard>
  );
}
