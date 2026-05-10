"use client";

import { Plug } from "lucide-react";
import type { CardKey } from "@/lib/types/user";
import type { StepRenderProps } from "./wizard";
import { OAuthButton } from "./oauth-button";

const cardOptions: Array<{ key: CardKey; label: string; description: string }> = [
  { key: "ticktick", label: "TickTick", description: "Tasks workspace" },
  { key: "calendar", label: "Calendar", description: "Daily timeline" },
  { key: "health", label: "Health & recovery", description: "Sleep, HRV, readiness" },
  { key: "finance", label: "Finance", description: "Spend, cashflow" },
  { key: "cars", label: "Cars", description: "Service log & health" },
  { key: "research", label: "Research", description: "Project pipeline" },
  { key: "applications", label: "Applications", description: "Med-school / programs" },
  { key: "journal", label: "Journal", description: "Daily entries" },
];

export function StepIntegrations({ state, setState, refreshUser }: StepRenderProps) {
  const toggle = (key: CardKey) =>
    setState((prev) => ({
      ...prev,
      visibleCards: { ...prev.visibleCards, [key]: !prev.visibleCards[key] },
    }));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
        <Plug className="h-3.5 w-3.5 text-neon-emerald" />
        Integrations
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-white">
        Connect your tools
      </h2>
      <p className="text-[13px] text-subtle">
        Connect Google Calendar and TickTick for live data, and pick which cards
        appear on your dashboard. Skip anything you don't use — empty cards are
        hidden, not faked.
      </p>

      <div className="space-y-2">
        <ProviderRow
          name="Google Calendar"
          description="Real events on the daily timeline."
          enabled={state.visibleCards.calendar}
          onToggle={() => toggle("calendar")}
          right={
            <OAuthButton
              provider="google"
              label="Google"
              connected={state.integrations.google.connected}
              onChange={refreshUser}
            />
          }
        />
        <ProviderRow
          name="TickTick"
          description="Live task inbox and projects."
          enabled={state.visibleCards.ticktick}
          onToggle={() => toggle("ticktick")}
          right={
            <OAuthButton
              provider="ticktick"
              label="TickTick"
              connected={state.integrations.ticktick.connected}
              onChange={refreshUser}
            />
          }
        />
      </div>

      <div className="pt-3">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-muted">
          Other dashboard cards
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {cardOptions
            .filter((c) => c.key !== "calendar" && c.key !== "ticktick")
            .map((c) => (
              <CardToggle
                key={c.key}
                label={c.label}
                description={c.description}
                enabled={state.visibleCards[c.key]}
                onToggle={() => toggle(c.key)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function ProviderRow({
  name,
  description,
  enabled,
  onToggle,
  right,
}: {
  name: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">
      <div className="flex items-center gap-3">
        <Switch checked={enabled} onChange={onToggle} />
        <div>
          <p className="text-[13px] text-white">{name}</p>
          <p className="text-[11px] text-muted">{description}</p>
        </div>
      </div>
      {right}
    </div>
  );
}

function CardToggle({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.015] p-3 text-left transition-colors hover:border-white/[0.12]"
    >
      <div>
        <p className="text-[13px] text-white">{label}</p>
        <p className="text-[11px] text-muted">{description}</p>
      </div>
      <Switch checked={enabled} onChange={onToggle} />
    </button>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <span
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`inline-flex h-5 w-9 cursor-pointer items-center rounded-full border transition-colors ${
        checked
          ? "border-neon-blue/40 bg-neon-blue/30"
          : "border-white/[0.08] bg-white/[0.04]"
      }`}
    >
      <span
        className={`h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </span>
  );
}
