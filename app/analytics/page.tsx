import { PageHeader } from "@/components/page-header";
import { LifeBalance } from "@/components/cards/life-balance";
import { AIInsights } from "@/components/cards/ai-insights";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";

const heatmap = Array.from({ length: 7 }, (_, r) =>
  Array.from({ length: 24 }, (_, c) => {
    const peak = c >= 9 && c <= 12;
    const evening = c >= 19 && c <= 21;
    const v = peak ? 0.8 + Math.random() * 0.2 : evening ? 0.5 + Math.random() * 0.3 : Math.random() * 0.4;
    return v;
  }),
);
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Analytics"
        title="Life patterns"
        description="Where your time, energy, and attention actually go — and what to do about it."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <LifeBalance />
        <AIInsights />
      </div>

      <GlassCard glow="blue" className="p-5">
        <CardHeader title="Deep-work heatmap" subtitle="Cognitive intensity by hour · last 4 weeks" />
        <div className="mt-4">
          <div className="grid grid-cols-[36px_1fr] gap-2">
            <div className="space-y-1">
              {days.map((d) => (
                <div key={d} className="flex h-5 items-center text-[10px] text-muted">{d}</div>
              ))}
            </div>
            <div className="space-y-1">
              {heatmap.map((row, r) => (
                <div key={r} className="grid grid-cols-24 gap-1" style={{ gridTemplateColumns: "repeat(24, minmax(0,1fr))" }}>
                  {row.map((v, c) => (
                    <div
                      key={c}
                      title={`${days[r]} ${c}:00 · ${(v * 100).toFixed(0)}`}
                      className="h-5 rounded-sm"
                      style={{
                        background: `rgba(91,140,255,${0.08 + v * 0.55})`,
                        boxShadow: v > 0.85 ? "0 0 8px rgba(91,140,255,0.45)" : undefined,
                      }}
                    />
                  ))}
                </div>
              ))}
              <div className="flex justify-between pt-1 font-mono text-[9px] text-muted">
                <span>00</span>
                <span>06</span>
                <span>12</span>
                <span>18</span>
                <span>23</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
