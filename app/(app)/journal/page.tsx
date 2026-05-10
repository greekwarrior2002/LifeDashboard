import { PageHeader } from "@/components/page-header";
import { JournalClient } from "@/components/journal-client";
import { journalEntries } from "@/lib/mock-data";

export default function JournalPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Journal"
        title="Daily reflection"
        description="A quiet space for end-of-day notes, mood, and patterns the AI can learn from."
      />
      <JournalClient sampleEntries={journalEntries} />
    </div>
  );
}
