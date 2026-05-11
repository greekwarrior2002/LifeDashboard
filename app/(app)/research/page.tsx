import { PageHeader } from "@/components/page-header";
import { ResearchCenter } from "@/components/cards/research-center";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { getLifeData } from "@/lib/life-data-store";

export const dynamic = "force-dynamic";

const upcoming = [
  { date: "May 14", title: "REB resubmission — Omeprazole pilot", status: "Drafting" },
  { date: "May 22", title: "CSEP abstract submission", status: "Final review" },
  { date: "May 28", title: "JSCR submission — Transcontinental case", status: "Co-author review" },
  { date: "Jun 04", title: "IAAO mid-study check-in", status: "Scheduled" },
];

const pubs = [
  { title: "Off-season detraining in elite cyclists", venue: "ACSM 2024 (poster)", year: 2024 },
  { title: "PPI use and post-exercise recovery", venue: "Working draft", year: 2025 },
];

export default async function ResearchPage() {
  const lifeData = await getLifeData();
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Research"
        title="Lab & Manuscripts"
        description="Three active studies, one manuscript in review, and conference deadlines tracked."
      />
      <ResearchCenter initialProjects={lifeData.researchProjects} />

      <div className="grid gap-5 md:grid-cols-2">
        <GlassCard glow="blue" className="p-5">
          <CardHeader title="Upcoming Deadlines" />
          <div className="mt-4 space-y-2">
            {upcoming.map((u, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
                <div>
                  <p className="text-[13px] text-white">{u.title}</p>
                  <p className="text-[11px] text-muted">{u.status}</p>
                </div>
                <span className="font-mono text-[11px] text-subtle">{u.date}</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard glow="violet" className="p-5">
          <CardHeader title="Publications & Outputs" />
          <div className="mt-4 space-y-2">
            {pubs.map((p, i) => (
              <div key={i} className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-3">
                <p className="text-[13px] text-white">{p.title}</p>
                <p className="mt-0.5 text-[11px] text-muted">{p.venue} · {p.year}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
