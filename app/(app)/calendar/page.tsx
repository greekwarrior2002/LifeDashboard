import { PageHeader } from "@/components/page-header";
import { CalendarTimeline } from "@/components/cards/calendar-timeline";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { calendarEvents } from "@/lib/mock-data";

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Calendar"
        title="Today, Friday May 9"
        description="Google Calendar — color-coded by category. The blue line shows real time."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CalendarTimeline />
        </div>
        <GlassCard glow="violet" className="p-5">
          <CardHeader title="Up Next" subtitle={`${calendarEvents.length} events today`} />
          <div className="mt-4 space-y-2">
            {calendarEvents.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2"
              >
                <div>
                  <p className="text-[13px] text-white">{e.title}</p>
                  <p className="text-[11px] text-muted">{e.location}</p>
                </div>
                <span className="font-mono text-[11px] text-subtle">{e.start}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
