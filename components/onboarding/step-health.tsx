"use client";

import { Activity, Moon } from "lucide-react";
import type { StepRenderProps } from "./wizard";

const SUGGESTED_HABITS = [
  "Morning walk",
  "Mobility",
  "Gym",
  "Meditation",
  "Reading",
  "Hydration",
  "Journal",
];

export function StepHealth({ state, setState }: StepRenderProps) {
  const update = <K extends keyof typeof state.health>(
    key: K,
    value: (typeof state.health)[K],
  ) =>
    setState((prev) => ({
      ...prev,
      health: { ...prev.health, [key]: value },
    }));

  const toggleHabit = (habit: string) => {
    const exists = state.health.habits.includes(habit);
    update(
      "habits",
      exists
        ? state.health.habits.filter((h) => h !== habit)
        : [...state.health.habits, habit],
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
        <Activity className="h-3.5 w-3.5 text-neon-emerald" />
        Health
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-white">
        Baselines
      </h2>
      <p className="text-[13px] text-subtle">
        Powers the recovery / sleep cards.
      </p>

      <div className="space-y-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12px] text-subtle">
              <Moon className="h-3.5 w-3.5 text-neon-blue" /> Sleep target
            </span>
            <span className="font-mono text-[12px] text-white">
              {state.health.sleepTargetHours.toFixed(1)} h
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={10}
            step={0.25}
            value={state.health.sleepTargetHours}
            onChange={(e) =>
              update("sleepTargetHours", parseFloat(e.target.value))
            }
            className="mt-3 w-full accent-neon-blue"
          />
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12px] text-subtle">
              <Activity className="h-3.5 w-3.5 text-neon-emerald" /> Recovery goal
            </span>
            <span className="font-mono text-[12px] text-white">
              {state.health.recoveryGoal}
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            step={1}
            value={state.health.recoveryGoal}
            onChange={(e) => update("recoveryGoal", parseInt(e.target.value, 10))}
            className="mt-3 w-full accent-neon-emerald"
          />
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted">
            Habits to track
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_HABITS.map((habit) => {
              const active = state.health.habits.includes(habit);
              return (
                <button
                  key={habit}
                  type="button"
                  onClick={() => toggleHabit(habit)}
                  className={`rounded-full border px-2.5 py-1 text-[12px] transition-colors ${
                    active
                      ? "border-neon-emerald/40 bg-neon-emerald/15 text-white"
                      : "border-white/[0.08] bg-white/[0.02] text-subtle hover:text-white"
                  }`}
                >
                  {habit}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
