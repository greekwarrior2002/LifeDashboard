import { PageHeader } from "@/components/page-header";
import { FinancialDashboard } from "@/components/cards/financial";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { formatCurrency } from "@/lib/utils";

const subs = [
  { name: "Spotify", cost: 11, due: "May 14" },
  { name: "iCloud 2TB", cost: 13, due: "May 18" },
  { name: "Notion", cost: 10, due: "May 22" },
  { name: "TickTick Premium", cost: 4, due: "May 26" },
  { name: "ChatGPT Plus", cost: 27, due: "May 30" },
];

export default function FinancePage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Finance"
        title="Cash flow & spend"
        description="Stipend, TA payments, grading income — tracked alongside conference, gas, food, and savings goals."
      />
      <FinancialDashboard />
      <div className="grid gap-5 md:grid-cols-2">
        <GlassCard glow="violet" className="p-5">
          <CardHeader title="Subscriptions" subtitle="Recurring · this month" />
          <div className="mt-4 space-y-1.5">
            {subs.map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2 text-[12px]">
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
            <p className="text-[28px] font-semibold text-white">{formatCurrency(560)} <span className="text-[12px] text-muted">/ {formatCurrency(700)}</span></p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.04]">
              <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-neon-emerald to-neon-cyan shadow-glow-emerald" />
            </div>
            <p className="mt-2 text-[12px] text-subtle">On pace · 80% of monthly target</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
