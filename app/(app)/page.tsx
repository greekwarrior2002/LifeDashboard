import { MorningBriefing } from "@/components/cards/morning-briefing";
import { PrioritiesCard } from "@/components/cards/priorities";
import { TickTickPanel } from "@/components/cards/ticktick-panel";
import { CalendarTimeline } from "@/components/cards/calendar-timeline";
import { ResearchCenter } from "@/components/cards/research-center";
import { RecoveryHealth } from "@/components/cards/recovery-health";
import { SleepConsistency } from "@/components/cards/sleep-consistency";
import { FinancialDashboard } from "@/components/cards/financial";
import { CarDashboard } from "@/components/cards/car-dashboard";
import { LifeBalance } from "@/components/cards/life-balance";
import { AIInsights } from "@/components/cards/ai-insights";
import { LifeTimeline } from "@/components/cards/life-timeline";

export default function MissionControl() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      {/* Row 1 — full-width briefing */}
      <MorningBriefing />

      {/* Row 2 — focus + ticktick + calendar */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <PrioritiesCard />
        </div>
        <div className="lg:col-span-3">
          <TickTickPanel />
        </div>
        <div className="lg:col-span-4">
          <CalendarTimeline />
        </div>
      </div>

      {/* Row 3 — research + recovery */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ResearchCenter />
        </div>
        <div className="lg:col-span-5 grid gap-5">
          <RecoveryHealth />
          <SleepConsistency />
        </div>
      </div>

      {/* Row 4 — finance + life balance + AI */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <FinancialDashboard />
        </div>
        <div className="lg:col-span-3">
          <LifeBalance />
        </div>
        <div className="lg:col-span-3">
          <AIInsights />
        </div>
      </div>

      {/* Row 5 — cars */}
      <CarDashboard />

      {/* Row 6 — life timeline */}
      <LifeTimeline />

      <footer className="flex items-center justify-between pb-4 pt-2 text-[11px] text-muted">
        <span>Life OS · personal build · v1.0</span>
        <span>Built for one. Calm. Intelligent. Yours.</span>
      </footer>
    </div>
  );
}
