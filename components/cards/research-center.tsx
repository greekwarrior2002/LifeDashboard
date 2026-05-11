"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FlaskConical, ChevronRight, Calendar, Check, Plus, Save, Trash2 } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { DEFAULT_LIFE_DATA, type ResearchProject } from "@/lib/life-data-shared";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const tone: Record<string, string> = {
  blue: "from-neon-blue to-neon-cyan",
  violet: "from-neon-violet to-neon-blue",
  emerald: "from-neon-emerald to-neon-cyan",
};

const blankProject = (): ResearchProject => ({
  id: `research-${Date.now()}`,
  title: "New research project",
  progress: 0,
  phase: "Planning",
  nextMilestone: "Define next milestone",
  color: "blue",
  pipeline: [
    { name: "Protocol", done: false, current: true },
    { name: "Ethics", done: false },
    { name: "Recruitment", done: false },
    { name: "Data", done: false },
    { name: "Manuscript", done: false },
  ],
  deadline: "TBD",
});

export function ResearchCenter({
  initialProjects = DEFAULT_LIFE_DATA.researchProjects,
  editable = true,
}: {
  initialProjects?: ResearchProject[];
  editable?: boolean;
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const subtitle = useMemo(() => {
    const active = projects.filter((p) => p.progress < 100).length;
    return `${active} active project${active === 1 ? "" : "s"} · editable`;
  }, [projects]);

  const updateProject = (id: string, patch: Partial<ResearchProject>) => {
    setProjects((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/life-data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ researchProjects: projects }),
      });
      if (!res.ok) throw new Error("save_failed");
      setSaved(true);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassCard glow="violet" className="p-5">
      <CardHeader
        title="Research Command Center"
        subtitle={subtitle}
        icon={<FlaskConical className="h-4 w-4 text-neon-violet" />}
        right={
          <div className="flex items-center gap-1.5">
            {saved ? (
              <span className="hidden items-center gap-1 text-[11px] text-neon-emerald sm:flex">
                <Check className="h-3 w-3" /> Saved
              </span>
            ) : null}
            {editable ? (
              <button
                onClick={() => (editing ? void save() : setEditing(true))}
                disabled={saving}
                className="flex h-7 items-center gap-1 rounded-md border border-neon-violet/25 bg-neon-violet/10 px-2 text-[11px] text-white transition-colors hover:bg-neon-violet/20 disabled:opacity-60"
              >
                <Save className="h-3 w-3" />
                {saving ? "Saving" : editing ? "Save" : "Edit"}
              </button>
            ) : null}
            <Link
              href="/research"
              className="flex h-7 items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-2 text-[11px] text-subtle transition-colors hover:text-white"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        }
      />

      <div className="mt-4 space-y-3">
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4 transition-colors hover:border-white/[0.10]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {editing ? (
                  <div className="grid gap-2">
                    <input
                      value={p.title}
                      onChange={(e) => updateProject(p.id, { title: e.target.value })}
                      className="h-8 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-[13px] text-white outline-none focus:border-neon-violet/40"
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={p.phase}
                        onChange={(e) => updateProject(p.id, { phase: e.target.value })}
                        className="h-8 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-[12px] text-subtle outline-none focus:border-neon-violet/40"
                        placeholder="Phase"
                      />
                      <input
                        value={p.nextMilestone}
                        onChange={(e) => updateProject(p.id, { nextMilestone: e.target.value })}
                        className="h-8 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-[12px] text-subtle outline-none focus:border-neon-violet/40"
                        placeholder="Next milestone"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-[14px] font-medium text-white">{p.title}</p>
                    <p className="mt-0.5 text-[12px] text-muted">
                      {p.phase} · <span className="text-subtle">{p.nextMilestone}</span>
                    </p>
                  </>
                )}
              </div>
              {editing ? (
                <div className="flex shrink-0 items-center gap-1">
                  <input
                    value={p.deadline}
                    onChange={(e) => updateProject(p.id, { deadline: e.target.value })}
                    className="h-8 w-20 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-[11px] text-subtle outline-none focus:border-neon-violet/40"
                  />
                  <button
                    onClick={() => setProjects((cur) => cur.filter((item) => item.id !== p.id))}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] text-muted hover:border-neon-rose/30 hover:text-neon-rose"
                    aria-label={`Delete ${p.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-muted">
                  <Calendar className="h-3 w-3" />
                  {p.deadline}
                </div>
              )}
            </div>

            {/* progress bar */}
            {editing ? (
              <label className="mt-3 grid gap-1 text-[11px] text-muted">
                Progress {p.progress}%
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={p.progress}
                  onChange={(e) => updateProject(p.id, { progress: Number(e.target.value) })}
                  className="accent-neon-violet"
                />
              </label>
            ) : (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.progress}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r shadow-glow",
                    tone[p.color] ?? tone.blue,
                  )}
                />
              </div>
            )}

            {editing ? (
              <textarea
                value={p.pipeline.map((step) => `${step.current ? "*" : step.done ? "x" : "-"} ${step.name}`).join("\n")}
                onChange={(e) =>
                  updateProject(p.id, {
                    pipeline: e.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => ({
                        name: line.replace(/^[-*x]\s*/i, ""),
                        done: /^x\s/i.test(line),
                        current: /^\*\s/.test(line),
                      })),
                  })
                }
                className="mt-3 min-h-24 w-full rounded-md border border-white/[0.08] bg-white/[0.03] p-2 text-[11px] leading-relaxed text-subtle outline-none focus:border-neon-violet/40"
                aria-label={`${p.title} pipeline`}
              />
            ) : null}

            {/* pipeline */}
            {!editing ? <div className="mt-3 flex items-center gap-1.5">
              {p.pipeline.map((step, idx) => (
                <div key={idx} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex w-full items-center gap-1">
                    <div
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        step.done
                          ? "bg-gradient-to-r from-neon-emerald to-neon-cyan"
                          : step.current
                            ? "bg-gradient-to-r from-neon-blue to-neon-violet animate-pulseGlow"
                            : "bg-white/[0.05]",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "hidden truncate text-[10px] tracking-wide sm:inline",
                      step.current
                        ? "text-white"
                        : step.done
                          ? "text-subtle"
                          : "text-muted",
                    )}
                  >
                    {step.name}
                  </span>
                </div>
              ))}
            </div> : null}
          </motion.div>
        ))}
      </div>
      {editing ? (
        <button
          onClick={() => setProjects((cur) => [...cur, blankProject()])}
          className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.10] text-[12px] text-subtle hover:border-neon-violet/30 hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" /> Add project
        </button>
      ) : null}
    </GlassCard>
  );
}
