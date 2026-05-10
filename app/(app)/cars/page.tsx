import { PageHeader } from "@/components/page-header";
import { CarDashboard } from "@/components/cards/car-dashboard";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";
import { cars } from "@/lib/mock-data";

export default function CarsPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Garage"
        title="Vehicles & Maintenance"
        description="Service history, mileage, and upcoming work for the daily and the weekend car."
      />
      <CarDashboard />

      <div className="grid gap-5 md:grid-cols-2">
        {cars.map((c) => (
          <GlassCard key={c.id} glow="amber" className="p-5">
            <CardHeader title={c.name} subtitle="Full service log" />
            <div className="mt-4 space-y-1.5">
              {c.log.map((l, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2 text-[12px]">
                  <span className="text-muted">{l.date}</span>
                  <span className="flex-1 px-3 text-white">{l.item}</span>
                  <span className="font-mono text-subtle">${l.cost}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
