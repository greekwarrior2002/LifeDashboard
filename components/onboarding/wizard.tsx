"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Command, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { PublicUserState } from "@/lib/types/user";
import { StepWelcome } from "./step-welcome";
import { StepProfile } from "./step-profile";
import { StepGoals } from "./step-goals";
import { StepIntegrations } from "./step-integrations";
import { StepHealth } from "./step-health";
import { StepDone } from "./step-done";

const DRAFT_KEY = "lifeos_onboarding_draft_v1";

type Step = {
  id: string;
  label: string;
  render: (props: StepRenderProps) => React.ReactNode;
  validate?: (state: PublicUserState) => string | null;
};

export type StepRenderProps = {
  state: PublicUserState;
  setState: (updater: (prev: PublicUserState) => PublicUserState) => void;
  refreshUser: () => Promise<void>;
};

export function OnboardingWizard({
  initialState,
}: {
  initialState: PublicUserState;
}) {
  const router = useRouter();
  const [state, setStateInner] = useState<PublicUserState>(initialState);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Restore profile/goals/health/cards from localStorage so a refresh keeps progress.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<PublicUserState>;
      setStateInner((prev) => ({
        ...prev,
        profile: { ...prev.profile, ...(draft.profile ?? {}) },
        goals: { ...prev.goals, ...(draft.goals ?? {}) },
        visibleCards: { ...prev.visibleCards, ...(draft.visibleCards ?? {}) },
        health: { ...prev.health, ...(draft.health ?? {}) },
      }));
    } catch {}
  }, []);

  const setState = useCallback<StepRenderProps["setState"]>((updater) => {
    setStateInner((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            profile: next.profile,
            goals: next.goals,
            visibleCards: next.visibleCards,
            health: next.health,
          }),
        );
      } catch {}
      return next;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await fetch("/api/user", { cache: "no-store" });
    if (!res.ok) return;
    const fresh = (await res.json()) as PublicUserState;
    setStateInner((prev) => ({
      ...prev,
      integrations: fresh.integrations,
      onboardingCompletedAt: fresh.onboardingCompletedAt,
    }));
  }, []);

  const steps: Step[] = useMemo(
    () => [
      { id: "welcome", label: "Welcome", render: (p) => <StepWelcome {...p} /> },
      {
        id: "profile",
        label: "Profile",
        render: (p) => <StepProfile {...p} />,
        validate: (s) =>
          s.profile.name.trim().length === 0 ? "Please enter your name." : null,
      },
      { id: "goals", label: "Goals", render: (p) => <StepGoals {...p} /> },
      {
        id: "integrations",
        label: "Integrations",
        render: (p) => <StepIntegrations {...p} />,
      },
      { id: "health", label: "Health", render: (p) => <StepHealth {...p} /> },
      { id: "done", label: "Finish", render: (p) => <StepDone {...p} /> },
    ],
    [],
  );

  const isLast = stepIndex === steps.length - 1;
  const current = steps[stepIndex];

  const persistStep = async (): Promise<boolean> => {
    setError(null);
    const validationError = current.validate?.(state);
    if (validationError) {
      setError(validationError);
      return false;
    }
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: state.profile,
          goals: state.goals,
          visibleCards: state.visibleCards,
          health: state.health,
        }),
      });
      if (!res.ok) {
        setError("Couldn't save — please try again.");
        return false;
      }
      return true;
    } catch {
      setError("Network error — please try again.");
      return false;
    }
  };

  const next = async () => {
    if (submitting) return;
    setSubmitting(true);
    const ok = await persistStep();
    setSubmitting(false);
    if (!ok) return;
    if (!isLast) {
      setStepIndex((i) => i + 1);
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/user/complete-onboarding", { method: "POST" });
    setSubmitting(false);
    if (!res.ok) {
      setError("Couldn't complete onboarding. Try again.");
      return;
    }
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    router.replace("/");
    router.refresh();
  };

  const back = () => {
    setError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-br from-neon-blue/30 to-neon-violet/30 shadow-glow">
          <Command className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Life OS
          </h1>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
            First-time setup
          </p>
        </div>
      </div>

      <Stepper steps={steps} current={stepIndex} />

      <div className="mt-6 flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 shadow-glass backdrop-blur-xl sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {current.render({ state, setState, refreshUser })}
          </motion.div>
        </AnimatePresence>

        {error ? (
          <p className="mt-4 text-[12px] text-neon-rose">{error}</p>
        ) : null}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={stepIndex === 0 || submitting}
            className={cn(
              "flex h-10 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 text-[12px] text-subtle transition-colors hover:text-white",
              (stepIndex === 0 || submitting) &&
                "cursor-not-allowed opacity-40 hover:text-subtle",
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <button
            type="button"
            onClick={next}
            disabled={submitting}
            className={cn(
              "flex h-10 items-center gap-1.5 rounded-xl border border-neon-blue/30 bg-gradient-to-r from-neon-blue/20 to-neon-violet/20 px-4 text-[13px] font-medium text-white shadow-glow transition-transform",
              !submitting && "hover:scale-[1.01]",
              submitting && "opacity-60",
            )}
          >
            {isLast ? (
              <>
                <Check className="h-3.5 w-3.5" /> Finish
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium transition-colors",
                done && "border-neon-emerald/40 bg-neon-emerald/15 text-neon-emerald",
                active && "border-neon-blue/40 bg-neon-blue/15 text-white",
                !done && !active && "border-white/10 bg-white/[0.02] text-muted",
              )}
            >
              {done ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            {i < steps.length - 1 ? (
              <div
                className={cn(
                  "h-px flex-1 transition-colors",
                  i < current ? "bg-neon-emerald/30" : "bg-white/[0.06]",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
