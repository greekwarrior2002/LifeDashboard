import { PageHeader } from "@/components/page-header";
import { CalendarTimeline } from "@/components/cards/calendar-timeline";
import { UpNextCard } from "@/components/cards/up-next";

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Calendar"
        title="Today"
        description="Google Calendar — events show with the blue current-time indicator."
      />
      <div className="grid gap-5 md:grid-cols-3">
        <div className="md:col-span-2">
          <CalendarTimeline />
        </div>
        <UpNextCard />
      </div>
    </div>
  );
}
