"use client";

import { useEffect } from "react";
import { User } from "lucide-react";
import type { StepRenderProps } from "./wizard";

export function StepProfile({ state, setState }: StepRenderProps) {
  useEffect(() => {
    if (!state.profile.timezone) {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz) {
          setState((prev) => ({
            ...prev,
            profile: { ...prev.profile, timezone: tz },
          }));
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (key: keyof typeof state.profile, value: string) =>
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, [key]: value },
    }));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
        <User className="h-3.5 w-3.5 text-neon-blue" />
        Profile
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-white">
        About you
      </h2>
      <p className="text-[13px] text-subtle">
        Used in the morning briefing and around the dashboard.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Name"
          value={state.profile.name}
          onChange={(v) => update("name", v)}
          placeholder="First name"
          autoFocus
        />
        <Field
          label="Program / role"
          value={state.profile.program}
          onChange={(v) => update("program", v)}
          placeholder="e.g. MSc Kinesiology"
        />
        <Field
          label="Current cycle"
          value={state.profile.cycle}
          onChange={(v) => update("cycle", v)}
          placeholder="e.g. Med School 2025/26"
        />
        <Field
          label="Time zone"
          value={state.profile.timezone}
          onChange={(v) => update("timezone", v)}
          placeholder="America/Toronto"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="mt-1.5 h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-[13px] text-white placeholder:text-muted focus:border-neon-blue/40 focus:outline-none"
      />
    </label>
  );
}
