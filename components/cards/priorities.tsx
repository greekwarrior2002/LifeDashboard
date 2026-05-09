"use client";

import { useState } from "react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { Check, Flame, GripVertical, Plus, Sparkles } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { todaysPriorities, type Task } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const priorityTone: Record<string, string> = {
  P1: "text-neon-rose border-neon-rose/30 bg-neon-rose/10",
  P2: "text-neon-amber border-neon-amber/30 bg-neon-amber/10",
  P3: "text-neon-blue border-neon-blue/30 bg-neon-blue/10",
};

export function PrioritiesCard() {
  const [tasks, setTasks] = useState<Task[]>(todaysPriorities);

  const toggle = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );

  const completed = tasks.filter((t) => t.done).length;

  return (
    <GlassCard glow="blue" className="p-5">
      <CardHeader
        title="Today's Priorities"
        subtitle={`${tasks.length - completed} open · ${completed} done · drag to reorder`}
        icon={<Flame className="h-4 w-4 text-neon-amber" />}
        right={
          <button className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 text-[11px] text-subtle transition-colors hover:bg-white/[0.05] hover:text-white">
            <Plus className="h-3 w-3" /> New
          </button>
        }
      />

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-neon-violet/20 bg-neon-violet/[0.06] px-3 py-2 text-[12px] text-subtle">
        <Sparkles className="h-3.5 w-3.5 text-neon-violet" />
        AI: <span className="text-white">Thesis Methods</span> is your highest-leverage block today.
      </div>

      <Reorder.Group
        axis="y"
        values={tasks}
        onReorder={setTasks}
        className="mt-3 space-y-1.5"
      >
        <AnimatePresence>
          {tasks.map((task) => (
            <Reorder.Item
              key={task.id}
              value={task}
              dragListener
              className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] px-3 py-2.5 transition-colors hover:border-white/[0.10] hover:bg-white/[0.04]"
            >
              <GripVertical className="h-3.5 w-3.5 cursor-grab text-muted opacity-0 transition-opacity group-hover:opacity-100" />
              <button
                onClick={() => toggle(task.id)}
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all",
                  task.done
                    ? "border-neon-emerald bg-neon-emerald/20 text-neon-emerald shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                    : "border-white/15 bg-white/[0.02] hover:border-white/30",
                )}
              >
                {task.done ? <Check className="h-3 w-3" /> : null}
              </button>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-[13px] font-medium transition-colors",
                    task.done ? "text-muted line-through" : "text-white",
                  )}
                >
                  {task.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                  <span>{task.project}</span>
                  <span>·</span>
                  <span>{task.due}</span>
                  {task.estMinutes ? (
                    <>
                      <span>·</span>
                      <span>{task.estMinutes}m</span>
                    </>
                  ) : null}
                </div>
              </div>

              <span
                className={cn(
                  "rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider",
                  priorityTone[task.priority],
                )}
              >
                {task.priority}
              </span>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </GlassCard>
  );
}
