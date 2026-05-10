"use client";

import { Flame, Plus, X } from "lucide-react";
import type { StepRenderProps } from "./wizard";

const MAX_PRIORITIES = 3;

export function StepGoals({ state, setState }: StepRenderProps) {
  const setPriorities = (next: string[]) =>
    setState((prev) => ({ ...prev, goals: { ...prev.goals, priorities: next } }));

  const setFocusAreas = (next: string[]) =>
    setState((prev) => ({ ...prev, goals: { ...prev.goals, focusAreas: next } }));

  const updatePriority = (index: number, value: string) => {
    const copy = [...state.goals.priorities];
    copy[index] = value;
    setPriorities(copy);
  };

  const addPriority = () => {
    if (state.goals.priorities.length >= MAX_PRIORITIES) return;
    setPriorities([...state.goals.priorities, ""]);
  };

  const removePriority = (index: number) => {
    setPriorities(state.goals.priorities.filter((_, i) => i !== index));
  };

  const focusText = state.goals.focusAreas.join(", ");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
        <Flame className="h-3.5 w-3.5 text-neon-amber" />
        Goals
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-white">
        Top priorities
      </h2>
      <p className="text-[13px] text-subtle">
        Up to {MAX_PRIORITIES} priorities — these surface on the dashboard's
        Today panel.
      </p>

      <div className="space-y-2">
        {state.goals.priorities.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.02] text-[11px] font-mono text-muted">
              {i + 1}
            </span>
            <input
              value={p}
              onChange={(e) => updatePriority(i, e.target.value)}
              placeholder="e.g. Finish thesis Methods section"
              className="h-10 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-[13px] text-white placeholder:text-muted focus:border-neon-blue/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removePriority(i)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.02] text-muted hover:text-white"
              aria-label="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {state.goals.priorities.length < MAX_PRIORITIES ? (
          <button
            type="button"
            onClick={addPriority}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-white/[0.08] bg-white/[0.01] px-3 text-[12px] text-subtle transition-colors hover:border-white/[0.15] hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Add a priority
          </button>
        ) : null}
      </div>

      <label className="block">
        <span className="text-[10px] uppercase tracking-widest text-muted">
          Focus areas (comma separated)
        </span>
        <input
          value={focusText}
          onChange={(e) =>
            setFocusAreas(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          placeholder="Research, Health, Med apps"
          className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-[13px] text-white placeholder:text-muted focus:border-neon-blue/40 focus:outline-none"
        />
      </label>
    </div>
  );
}
