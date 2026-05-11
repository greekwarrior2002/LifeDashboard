import { PageHeader } from "@/components/page-header";
import { LifeTimeline } from "@/components/cards/life-timeline";
import { getLifeData } from "@/lib/life-data-store";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const lifeData = await getLifeData();
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Timeline"
        title="Life arc"
        description="Milestones, conferences, publications, applications, trips, and long-term goals — one continuous thread."
      />
      <LifeTimeline initialMilestones={lifeData.timeline} />
    </div>
  );
}
