import { PageHeader } from "@/components/page-header";
import { FinancialDashboard } from "@/components/cards/financial";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { formatCurrency } from "@/lib/utils";
import { getLifeData } from "@/lib/life-data-store";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const lifeData = await getLifeData();
  const { subscriptions, savings } = lifeData.finance;
  const savingsProgress = savings.goal > 0 ? Math.min(100, Math.round((savings.current / savings.goal) * 100)) : 0;
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Finance"
        title="Cash flow & spend"
        description="Stipend, TA payments, grading income — tracked alongside conference, gas, food, and savings goals."
      />
      <FinancialDashboard initialFinance={lifeData.finance} />
      <div className="grid gap-5 md:grid-cols-2">
        <GlassCard glow="violet" className="p-5">
          <CardHeader title="Subscriptions" subtitle="Recurring · this month" />
          <div className="mt-4 space-y-1.5">
            {subscriptions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2 text-[12px]">
                <span className="text-white">{s.name}</span>
                <span className="text-muted">{s.due}</span>
                <span className="font-mono text-subtle">{formatCurrency(s.cost)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard glow="emerald" className="p-5">
          <CardHeader title="Savings" subtitle="May goal" />
          <div className="mt-4">
            <p className="text-[28px] font-semibold text-white">{formatCurrency(savings.current)} <span className="text-[12px] text-muted">/ {formatCurrency(savings.goal)}</span></p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.04]">
              <div className="h-full rounded-full bg-gradient-to-r from-neon-emerald to-neon-cyan shadow-glow-emerald" style={{ width: `${savingsProgress}%` }} />
            </div>
            <p className="mt-2 text-[12px] text-subtle">On pace · {savingsProgress}% of monthly target</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
