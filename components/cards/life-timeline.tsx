"use client";

import { motion } from "framer-motion";
import { Clock, GraduationCap, Award, FlaskConical, Plane, Target, BookOpen, Save, Plus, Trash2, Check } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { DEFAULT_LIFE_DATA, type TimelineMilestone } from "@/lib/life-data-shared";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const kindIcon: Record<string, React.ElementType> = {
  academic: GraduationCap,
  conference: BookOpen,
  achievement: Award,
  research: FlaskConical,
  trip: Plane,
  application: GraduationCap,
  goal: Target,
  personal: Clock,
};
const kindTone: Record<string, string> = {
  academic: "from-neon-blue to-neon-cyan",
  conference: "from-neon-violet to-neon-blue",
  achievement: "from-neon-amber to-neon-rose",
  research: "from-neon-violet to-neon-blue",
  trip: "from-neon-emerald to-neon-cyan",
  application: "from-neon-blue to-neon-violet",
  goal: "from-neon-rose to-neon-violet",
  personal: "from-neon-emerald to-neon-blue",
};

const statusTone: Record<TimelineMilestone["status"], string> = {
  done: "border-neon-emerald/20 bg-neon-emerald/[0.06] text-neon-emerald",
  active: "border-neon-blue/20 bg-neon-blue/[0.06] text-neon-blue",
  planned: "border-white/[0.08] bg-white/[0.03] text-muted",
};

const newMilestone = (): TimelineMilestone => ({
  id: `milestone-${Date.now()}`,
  date: "2026 · TBD",
  title: "New milestone",
  kind: "personal",
  status: "planned",
});

export function LifeTimeline({
  initialMilestones = DEFAULT_LIFE_DATA.timeline,
  editable = true,
}: {
  initialMilestones?: TimelineMilestone[];
  editable?: boolean;
}) {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const subtitle = useMemo(() => {
    const active = milestones.filter((m) => m.status === "active").length;
    const planned = milestones.filter((m) => m.status === "planned").length;
    return `${active} active · ${planned} planned · editable timeline`;
  }, [milestones]);

  const updateMilestone = (id: string, patch: Partial<TimelineMilestone>) => {
    setMilestones((cur) => cur.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/life-data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeline: milestones }),
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
        title="Life Timeline"
        subtitle={subtitle}
        icon={<Clock className="h-4 w-4 text-neon-blue" />}
        right={
          editable ? (
            <div className="flex items-center gap-1.5">
              {saved ? (
                <span className="hidden items-center gap-1 text-[11px] text-neon-emerald sm:flex">
                  <Check className="h-3 w-3" /> Saved
                </span>
              ) : null}
              <button
                onClick={() => (editing ? void save() : setEditing(true))}
                disabled={saving}
                className="flex h-7 items-center gap-1 rounded-md border border-neon-blue/25 bg-neon-blue/10 px-2 text-[11px] text-white hover:bg-neon-blue/20 disabled:opacity-60"
              >
                <Save className="h-3 w-3" />
                {saving ? "Saving" : editing ? "Save" : "Edit"}
              </button>
            </div>
          ) : null
        }
      />

      {editing ? (
        <div className="mt-4 space-y-2">
          {milestones.map((m) => (
            <div key={m.id} className="grid gap-2 rounded-xl border border-white/[0.05] bg-white/[0.015] p-3 md:grid-cols-[0.8fr_1.6fr_0.9fr_0.8fr_auto]">
              <input value={m.date} onChange={(e) => updateMilestone(m.id, { date: e.target.value })} className="h-8 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-[12px] text-white outline-none" />
              <input value={m.title} onChange={(e) => updateMilestone(m.id, { title: e.target.value })} className="h-8 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-[12px] text-white outline-none" />
              <select value={m.kind} onChange={(e) => updateMilestone(m.id, { kind: e.target.value as TimelineMilestone["kind"] })} className="h-8 rounded-md border border-white/[0.08] bg-ink-900 px-2 text-[12px] text-white outline-none">
                {Object.keys(kindIcon).map((kind) => <option key={kind} value={kind}>{kind}</option>)}
              </select>
              <select value={m.status} onChange={(e) => updateMilestone(m.id, { status: e.target.value as TimelineMilestone["status"] })} className="h-8 rounded-md border border-white/[0.08] bg-ink-900 px-2 text-[12px] text-white outline-none">
                <option value="done">done</option>
                <option value="active">active</option>
                <option value="planned">planned</option>
              </select>
              <button onClick={() => setMilestones((cur) => cur.filter((item) => item.id !== m.id))} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] text-muted hover:text-neon-rose">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setMilestones((cur) => [...cur, newMilestone()])}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.10] text-[12px] text-subtle hover:border-neon-blue/30 hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" /> Add milestone
          </button>
        </div>
      ) : null}

      {/* Desktop / tablet: horizontal zigzag */}
      {!editing ? <div className="mt-5 hidden overflow-x-auto pb-2 md:block">
        <div className="relative min-w-[800px]">
          {/* spine */}
          <div className="absolute left-0 right-0 top-7 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="grid auto-cols-[minmax(9rem,1fr)] grid-flow-col gap-4">
            {milestones.map((m, i) => {
              const Icon = kindIcon[m.kind] ?? Clock;
              const tone = kindTone[m.kind] ?? "from-neon-blue to-neon-violet";
              const above = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative flex flex-col items-center"
                >
                  <div className={cn("order-2 mt-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.10] bg-ink-900 shadow-glow")}>
                    <div className={cn("h-3 w-3 rounded-full bg-gradient-to-br", tone)} />
                  </div>
                  <div
                    className={cn(
                      "w-full rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-[11px] backdrop-blur-md",
                      above ? "order-1" : "order-3 mt-2",
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-muted">
                      <Icon className="h-3 w-3" />
                      {m.date}
                    </div>
                    <p className="mt-1 text-[12px] font-medium text-white">{m.title}</p>
                    <span className={cn("mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px]", statusTone[m.status])}>
                      {m.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div> : null}

      {/* Mobile: vertical spine */}
      {!editing ? <ol className="relative ml-2 mt-5 space-y-3 border-l border-white/[0.10] pl-5 md:hidden">
        {milestones.map((m, i) => {
          const Icon = kindIcon[m.kind] ?? Clock;
          const tone = kindTone[m.kind] ?? "from-neon-blue to-neon-violet";
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="relative"
            >
              <span
                className={cn(
                  "absolute -left-[27px] top-2 flex h-4 w-4 items-center justify-center rounded-full border border-white/[0.10] bg-ink-900 shadow-glow",
                )}
              >
                <span className={cn("h-2 w-2 rounded-full bg-gradient-to-br", tone)} />
              </span>
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-[11px] text-muted">
                  <Icon className="h-3 w-3" />
                  {m.date}
                </div>
                <p className="mt-1 text-[13px] font-medium text-white">{m.title}</p>
                <span className={cn("mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px]", statusTone[m.status])}>
                  {m.status}
                </span>
              </div>
            </motion.li>
          );
        })}
      </ol> : null}
    </GlassCard>
  );
}
