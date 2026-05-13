"use client";

import { Sparkles } from "lucide-react";
import type { StepRenderProps } from "./wizard";

export function StepWelcome(_props: StepRenderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted">
        <Sparkles className="h-3.5 w-3.5 text-neon-violet" />
        Welcome
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-white">
        Let's set up your dashboard.
      </h2>
      <p className="text-[14px] leading-relaxed text-subtle">
        A few quick steps to make Life OS yours: tell us about your work, your
        goals, and which tools to connect. Everything saves as you go - you can
        edit it later in Settings.
      </p>
      <ul className="mt-4 space-y-2 text-[13px] text-subtle">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neon-blue" />
          Profile & timezone
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neon-violet" />
          Goals and the cards you want on your dashboard
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neon-emerald" />
          Connect Google Calendar and Apple Health, or skip either one for now
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neon-amber" />
          Sleep targets and habits
        </li>
      </ul>
    </div>
  );
}
