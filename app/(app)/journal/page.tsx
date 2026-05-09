import { PageHeader } from "@/components/page-header";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { journalEntries } from "@/lib/mock-data";

export default function JournalPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Journal"
        title="Daily reflection"
        description="A quiet space for end-of-day notes, mood, and patterns the AI can learn from."
      />
      <GlassCard glow="violet" className="p-5">
        <CardHeader title="New entry" subtitle="Today, May 9" />
        <textarea
          rows={4}
          placeholder="What went well? What slowed you down?"
          className="mt-3 w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[13px] text-white placeholder:text-muted focus:border-neon-blue/40 focus:outline-none"
        />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                className="h-7 w-7 rounded-md border border-white/[0.06] bg-white/[0.02] text-[11px] text-subtle hover:bg-white/[0.06] hover:text-white"
              >
                {n}
              </button>
            ))}
          </div>
          <button className="rounded-lg border border-neon-blue/30 bg-gradient-to-r from-neon-blue/15 to-neon-violet/15 px-3 py-1.5 text-[12px] text-white shadow-glow hover:scale-[1.02]">
            Save
          </button>
        </div>
      </GlassCard>

      <div className="space-y-3">
        {journalEntries.map((j, i) => (
          <GlassCard key={i} glow="blue" className="p-5">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted">{j.date}</p>
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
    </div>
  );
}
