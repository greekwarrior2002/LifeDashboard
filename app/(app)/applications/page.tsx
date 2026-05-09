import { PageHeader } from "@/components/page-header";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { medApps } from "@/lib/mock-data";

export default function ApplicationsPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Applications"
        title="Med School Cycle"
        description="Track each school by stage — CASPer, personal statement, references, and final submission."
      />
      <div className="grid gap-3 lg:grid-cols-2">
        {medApps.map((m) => (
          <GlassCard key={m.school} glow="violet" className="p-5">
            <CardHeader title={m.school} subtitle={`${m.stage} · due ${m.deadline}`} />
            <div className="mt-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-violet shadow-glow"
                  style={{ width: `${m.progress}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[12px] text-muted">
                <span>{m.progress}% complete</span>
                <span>Next: refine essay block</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
