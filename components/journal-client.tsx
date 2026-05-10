"use client";

import { useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

type SampleEntry = {
  date: string;
  mood: number;
  title: string;
  body: string;
};

type Entry = {
  id: string;
  isoDate: string;
  mood: number;
  body: string;
};

const STORAGE_KEY = "lifeos_journal_v1";

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
}

function formatStored(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function deriveTitle(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return "Untitled";
  const firstLine = trimmed.split(/\r?\n/)[0]!;
  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}…` : firstLine;
}

export function JournalClient({ sampleEntries }: { sampleEntries: SampleEntry[] }) {
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Entry[];
        if (Array.isArray(parsed)) setEntries(parsed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  const persist = (next: Entry[]) => {
    setEntries(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const save = () => {
    const trimmed = body.trim();
    if (!trimmed || mood === null) return;
    const entry: Entry = {
      id: `j_${Date.now()}`,
      isoDate: new Date().toISOString(),
      mood,
      body: trimmed,
    };
    persist([entry, ...entries]);
    setBody("");
    setMood(null);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const remove = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
  };

  const canSave = body.trim().length > 0 && mood !== null;

  return (
    <>
      <GlassCard glow="violet" className="p-5">
        <CardHeader
          title="New entry"
          subtitle={`Today, ${todayLabel()}`}
          right={
            savedFlash ? (
              <span className="flex items-center gap-1 text-[11px] text-neon-emerald">
                <Check className="h-3 w-3" /> Saved
              </span>
            ) : null
          }
        />
        <textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What went well? What slowed you down?"
          className="mt-3 w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[13px] text-white placeholder:text-muted focus:border-neon-blue/40 focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMood(n)}
                className={cn(
                  "h-7 w-7 rounded-md border text-[11px] transition-colors",
                  mood === n
                    ? "border-neon-blue/40 bg-neon-blue/15 text-white"
                    : "border-white/[0.06] bg-white/[0.02] text-subtle hover:bg-white/[0.06] hover:text-white",
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className={cn(
              "rounded-lg border border-neon-blue/30 bg-gradient-to-r from-neon-blue/15 to-neon-violet/15 px-3 py-1.5 text-[12px] text-white shadow-glow transition-transform",
              canSave ? "hover:scale-[1.02]" : "cursor-not-allowed opacity-50",
            )}
          >
            Save
          </button>
        </div>
        {!canSave && (body.length > 0 || mood !== null) ? (
          <p className="mt-2 text-[11px] text-muted">
            {body.trim().length === 0
              ? "Write something before saving."
              : "Pick a mood (1–10) before saving."}
          </p>
        ) : null}
      </GlassCard>

      <div className="space-y-3">
        {hydrated && entries.length === 0 ? null : null}
        {entries.map((j) => (
          <GlassCard key={j.id} glow="violet" className="p-5">
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-widest text-muted">
                  {formatStored(j.isoDate)}
                </p>
                <h3 className="mt-1 truncate text-[15px] font-semibold text-white">
                  {deriveTitle(j.body)}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-neon-emerald/30 bg-neon-emerald/10 px-2 py-0.5 text-[11px] text-neon-emerald">
                  Mood {j.mood}
                </span>
                <button
                  type="button"
                  onClick={() => remove(j.id)}
                  title="Delete entry"
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.02] text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-subtle">
              {j.body}
            </p>
          </GlassCard>
        ))}

        {sampleEntries.map((j, i) => (
          <GlassCard key={`sample-${i}`} glow="blue" className="p-5 opacity-90">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted">
                  {j.date} · sample
                </p>
                <h3 className="mt-1 text-[15px] font-semibold text-white">{j.title}</h3>
              </div>
              <span className="rounded-md border border-neon-emerald/30 bg-neon-emerald/10 px-2 py-0.5 text-[11px] text-neon-emerald">
                Mood {j.mood}
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-subtle">{j.body}</p>
          </GlassCard>
        ))}
      </div>
    </>
  );
}
