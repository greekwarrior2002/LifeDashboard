"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { OAuthButton } from "@/components/onboarding/oauth-button";
import type { CardKey, PublicUserState } from "@/lib/types/user";

const cardOptions: Array<{ key: CardKey; label: string }> = [
  { key: "ticktick", label: "TickTick" },
  { key: "calendar", label: "Calendar" },
  { key: "health", label: "Health" },
  { key: "finance", label: "Finance" },
  { key: "cars", label: "Cars" },
  { key: "research", label: "Research" },
  { key: "applications", label: "Applications" },
  { key: "journal", label: "Journal" },
];

export function SettingsClient({
  initialState,
}: {
  initialState: PublicUserState;
}) {
  const [state, setState] = useState<PublicUserState>(initialState);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const dirtyRef = useRef(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/user", { cache: "no-store" });
    if (res.ok) {
      const fresh = (await res.json()) as PublicUserState;
      setState(fresh);
    }
  }, []);

  const save = useCallback(async (next: PublicUserState) => {
    setSaving(true);
    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: next.profile,
          goals: next.goals,
          visibleCards: next.visibleCards,
          health: next.health,
        }),
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }, []);

  // Debounced autosave whenever state mutates locally (not from refresh).
  useEffect(() => {
    if (!dirtyRef.current) return;
    const handle = setTimeout(() => {
      dirtyRef.current = false;
      void save(state);
    }, 600);
    return () => clearTimeout(handle);
  }, [state, save]);

  const update = (updater: (s: PublicUserState) => PublicUserState) => {
    dirtyRef.current = true;
    setState(updater);
  };

  return (
    <div className="space-y-5">
      <GlassCard glow="blue" className="p-5">
        <CardHeader
          title="Integrations"
          right={
            saving ? (
              <span className="flex items-center gap-1 text-[11px] text-muted">
                <Loader2 className="h-3 w-3 animate-spin" /> Saving
              </span>
            ) : savedAt ? (
              <span className="flex items-center gap-1 text-[11px] text-neon-emerald">
                <Check className="h-3 w-3" /> Saved
              </span>
            ) : null
          }
        />
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-3">
            <div>
              <p className="text-[13px] text-white">Google Calendar</p>
              <p className="text-[11px] text-muted">
                {state.integrations.google.connected
                  ? `Connected${state.integrations.google.connectedAt ? ` · ${new Date(state.integrations.google.connectedAt).toLocaleDateString()}` : ""}`
                  : "Real-time events on the timeline"}
              </p>
            </div>
            <OAuthButton
              provider="google"
              label="Google"
              connected={state.integrations.google.connected}
              onChange={refresh}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-3">
            <div>
              <p className="text-[13px] text-white">TickTick</p>
              <p className="text-[11px] text-muted">
                {state.integrations.ticktick.connected
                  ? `Connected${state.integrations.ticktick.connectedAt ? ` · ${new Date(state.integrations.ticktick.connectedAt).toLocaleDateString()}` : ""}`
                  : "Live tasks and projects"}
              </p>
            </div>
            <OAuthButton
              provider="ticktick"
              label="TickTick"
              connected={state.integrations.ticktick.connected}
              onChange={refresh}
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard glow="violet" className="p-5">
        <CardHeader title="Profile" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field
            label="Name"
            value={state.profile.name}
            onChange={(v) =>
              update((s) => ({ ...s, profile: { ...s.profile, name: v } }))
            }
          />
          <Field
            label="Program"
            value={state.profile.program}
            onChange={(v) =>
              update((s) => ({ ...s, profile: { ...s.profile, program: v } }))
            }
          />
          <Field
            label="Cycle"
            value={state.profile.cycle}
            onChange={(v) =>
              update((s) => ({ ...s, profile: { ...s.profile, cycle: v } }))
            }
          />
          <Field
            label="Time zone"
            value={state.profile.timezone}
            onChange={(v) =>
              update((s) => ({ ...s, profile: { ...s.profile, timezone: v } }))
            }
          />
        </div>
      </GlassCard>

      <GlassCard glow="emerald" className="p-5">
        <CardHeader title="Dashboard cards" />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {cardOptions.map((c) => (
            <label
              key={c.key}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5"
            >
              <span className="text-[13px] text-white">{c.label}</span>
              <input
                type="checkbox"
                checked={state.visibleCards[c.key]}
                onChange={() =>
                  update((s) => ({
                    ...s,
                    visibleCards: {
                      ...s.visibleCards,
                      [c.key]: !s.visibleCards[c.key],
                    },
                  }))
                }
                className="h-4 w-4 accent-neon-blue"
              />
            </label>
          ))}
        </div>
      </GlassCard>

      <GlassCard glow="amber" className="p-5">
        <CardHeader title="Health baselines" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Sleep target (h)"
            value={state.health.sleepTargetHours}
            min={5}
            max={10}
            step={0.25}
            onChange={(v) =>
              update((s) => ({
                ...s,
                health: { ...s.health, sleepTargetHours: v },
              }))
            }
          />
          <NumberField
            label="Recovery goal"
            value={state.health.recoveryGoal}
            min={50}
            max={100}
            step={1}
            onChange={(v) =>
              update((s) => ({
                ...s,
                health: { ...s.health, recoveryGoal: v },
              }))
            }
          />
        </div>
      </GlassCard>

      <p className="flex items-center gap-1.5 text-[11px] text-muted">
        <Save className="h-3 w-3" /> Changes save automatically.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block rounded-lg border border-white/[0.05] bg-white/[0.015] p-3">
      <span className="text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-7 w-full bg-transparent text-[13px] text-white placeholder:text-muted focus:outline-none"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <label className="block rounded-lg border border-white/[0.05] bg-white/[0.015] p-3">
      <span className="text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="mt-1 h-7 w-full bg-transparent text-[13px] text-white focus:outline-none"
      />
    </label>
  );
}
