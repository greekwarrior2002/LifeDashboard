import { PageHeader } from "@/components/page-header";
import { PrioritiesCard } from "@/components/cards/priorities";
import { TickTickPanel } from "@/components/cards/ticktick-panel";

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Tasks"
        title="What matters today"
        description="TickTick-synced task workspace with AI prioritization, overload detection, and deep-work suggestions."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <PrioritiesCard />
        <TickTickPanel />
      </div>
    </div>
  );
}
