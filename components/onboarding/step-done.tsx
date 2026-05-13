"use client";

import { Check, Sparkles } from "lucide-react";
import type { StepRenderProps } from "./wizard";

export function StepDone({ state }: StepRenderProps) {
  const connected: string[] = [];
  if (state.integrations.google.connected) connected.push("Google Calendar");
  if (state.integrations.apple_health.connected) connected.push("Apple Health");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
        <Sparkles className="h-3.5 w-3.5 text-neon-violet" />
        Ready
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-white">
        You're all set, {state.profile.name || "friend"}.
      </h2>
      <p className="text-[13px] text-subtle">
        Hit Finish to land on your dashboard. You can change anything later in
        Settings.
      </p>

      <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
        <Row label="Name" value={state.profile.name || "-"} />
        <Row label="Time zone" value={state.profile.timezone || "-"} />
        <Row
          label="Priorities"
          value={
            state.goals.priorities.filter(Boolean).length > 0
              ? `${state.goals.priorities.filter(Boolean).length} set`
              : "None yet"
          }
        />
        <Row
          label="Connected"
          value={connected.length > 0 ? connected.join(", ") : "None - using empty states"}
        />
        <Row
          label="Sleep target"
          value={`${state.health.sleepTargetHours.toFixed(1)} h`}
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[12px]">
      <span className="text-muted">{label}</span>
      <span className="flex items-center gap-1.5 text-white">
        <Check className="h-3 w-3 text-neon-emerald" />
        {value}
      </span>
    </div>
  );
}
