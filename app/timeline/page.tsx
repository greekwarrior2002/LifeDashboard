import { PageHeader } from "@/components/page-header";
import { LifeTimeline } from "@/components/cards/life-timeline";

export default function TimelinePage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Timeline"
        title="Life arc"
        description="Milestones, conferences, publications, applications, trips, and long-term goals — one continuous thread."
      />
      <LifeTimeline />
    </div>
  );
}
