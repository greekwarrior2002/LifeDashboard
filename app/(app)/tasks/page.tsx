import { PageHeader } from "@/components/page-header";
import { PrioritiesCard } from "@/components/cards/priorities";

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Tasks"
        title="What matters today"
        description="A focused priorities workspace for today, without external task integrations."
      />
      <div className="max-w-3xl">
        <PrioritiesCard />
      </div>
    </div>
  );
}
