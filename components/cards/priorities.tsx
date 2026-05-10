"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { Check, Flame, GripVertical, Plus, Sparkles } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { useUser } from "@/lib/hooks/use-user";
import { cn } from "@/lib/utils";

type Item = { id: string; title: string; done: boolean };

export function PrioritiesCard() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Item[]>([]);
  const [adding, setAdding] = useState("");

  useEffect(() => {
    if (!user) return;
    const items = (user.goals.priorities ?? [])
      .filter((p) => p.trim().length > 0)
      .map((p, i) => ({ id: `p${i}`, title: p, done: false }));
    setTasks(items);
  }, [user]);

  const persist = async (next: Item[]) => {
    setTasks(next);
    await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goals: { priorities: next.filter((t) => !t.done).map((t) => t.title) },
      }),
    });
  };

  const toggle = (id: string) => {
    const next = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTasks(next);
  };

  const add = async () => {
    const title = adding.trim();
    if (!title) return;
    const next = [...tasks, { id: `n${Date.now()}`, title, done: false }];
    setAdding("");
    await persist(next);
  };

  const completed = tasks.filter((t) => t.done).length;

  return (
    <GlassCard glow="blue" className="p-5">
      <CardHeader
        title="Today's Priorities"
        subtitle={
          tasks.length === 0
            ? "No priorities set — add some below"
            : `${tasks.length - completed} open · ${completed} done · drag to reorder`
        }
        icon={<Flame className="h-4 w-4 text-neon-amber" />}
      />

      {user?.goals.focusAreas && user.goals.focusAreas.length > 0 ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-neon-violet/20 bg-neon-violet/[0.06] px-3 py-2 text-[12px] text-subtle">
          <Sparkles className="h-3.5 w-3.5 text-neon-violet" />
          Focus:{" "}
          <span className="text-white">
            {user.goals.focusAreas.join(" · ")}
          </span>
        </div>
      ) : null}

      <Reorder.Group
        axis="y"
        values={tasks}
        onReorder={(next) => void persist(next)}
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
              <GripVertical className="h-4 w-4 cursor-grab text-muted opacity-100 transition-opacity sm:h-3.5 sm:w-3.5 sm:opacity-0 sm:group-hover:opacity-100" />
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
              </div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          placeholder="Add a priority…"
          className="h-11 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-[14px] text-white placeholder:text-muted focus:border-neon-blue/40 focus:outline-none sm:h-9 sm:text-[12px]"
        />
        <button
          type="submit"
          className="flex h-11 items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-3 text-[12px] text-subtle transition-colors hover:bg-white/[0.05] hover:text-white sm:h-9 sm:px-2.5 sm:text-[11px]"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </form>
    </GlassCard>
  );
}
