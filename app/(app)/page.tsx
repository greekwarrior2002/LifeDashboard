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
import { getUser } from "@/lib/user-store";

export const dynamic = "force-dynamic";

export default async function MissionControl() {
  const user = await getUser();
  const visible = user.visibleCards;

  const showTickTick = visible.ticktick;
  const showCalendar = visible.calendar;
  const showResearch = visible.research;
  const showHealth = visible.health;
  const showFinance = visible.finance;
  const showCars = visible.cars;
  const showJournal = visible.journal;

  const row2Span = (() => {
    if (showTickTick && showCalendar) return ["lg:col-span-5", "lg:col-span-3", "lg:col-span-4"] as const;
    if (showTickTick) return ["lg:col-span-7", "lg:col-span-5", null] as const;
    if (showCalendar) return ["lg:col-span-7", null, "lg:col-span-5"] as const;
    return ["lg:col-span-12", null, null] as const;
  })();

  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <MorningBriefing />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className={row2Span[0]}>
          <PrioritiesCard />
        </div>
        {showTickTick ? (
          <div className={row2Span[1] ?? "lg:col-span-3"}>
            <TickTickPanel />
          </div>
        ) : null}
        {showCalendar ? (
          <div className={row2Span[2] ?? "lg:col-span-4"}>
            <CalendarTimeline />
          </div>
        ) : null}
      </div>

      {showResearch || showHealth ? (
        <div className="grid gap-5 lg:grid-cols-12">
          {showResearch ? (
            <div className={showHealth ? "lg:col-span-7" : "lg:col-span-12"}>
              <ResearchCenter />
            </div>
          ) : null}
          {showHealth ? (
            <div
              className={`grid gap-5 ${showResearch ? "lg:col-span-5" : "lg:col-span-12"}`}
            >
              <RecoveryHealth />
              <SleepConsistency />
            </div>
          ) : null}
        </div>
      ) : null}

      {showFinance || showJournal ? (
        <div className="grid gap-5 lg:grid-cols-12">
          {showFinance ? (
            <div className="lg:col-span-6">
              <FinancialDashboard />
            </div>
          ) : null}
          <div className="lg:col-span-3">
            <LifeBalance />
          </div>
          <div className="lg:col-span-3">
            <AIInsights />
          </div>
        </div>
      ) : null}

      {showCars ? <CarDashboard /> : null}

      <LifeTimeline />

      <footer className="flex items-center justify-between pb-4 pt-2 text-[11px] text-muted">
        <span>Life OS · personal build</span>
        <span>Built for one. Calm. Intelligent. Yours.</span>
      </footer>
    </div>
  );
}
