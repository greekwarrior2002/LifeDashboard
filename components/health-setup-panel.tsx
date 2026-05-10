import { Activity, CheckCircle2, Smartphone, UploadCloud } from "lucide-react";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";

export function HealthSetupPanel({
  connected,
  lastSync,
}: {
  connected: boolean;
  lastSync?: string | null;
}) {
  return (
    <GlassCard glow={connected ? "emerald" : "amber"} className="p-5">
      <CardHeader
        title="Apple Health Sync"
        subtitle={
          connected
            ? lastSync
              ? `Connected · last sync ${new Date(lastSync).toLocaleString()}`
              : "Connected · waiting for the first iPhone export"
            : "Web apps cannot read HealthKit directly"
        }
        icon={<Smartphone className="h-4 w-4 text-neon-emerald" />}
      />
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {[
          {
            icon: <Smartphone className="h-4 w-4" />,
            title: "iOS companion",
            body: "Use a native iPhone app with HealthKit permissions. The current web app cannot request HealthKit directly.",
          },
          {
            icon: <CheckCircle2 className="h-4 w-4" />,
            title: "Permissions",
            body: "Grant sleep, HRV, resting HR, steps, workouts, active energy, body mass, blood pressure, and SpO2 as desired.",
          },
          {
            icon: <UploadCloud className="h-4 w-4" />,
            title: "Sync",
            body: "The iOS side posts selected rollups to this dashboard's Apple Health ingest endpoint using your private API key.",
          },
          {
            icon: <Activity className="h-4 w-4" />,
            title: "Dashboard",
            body: "Cards show only real synced data. Missing metrics remain empty instead of being faked.",
          },
        ].map((step) => (
          <div
            key={step.title}
            className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-3"
          >
            <div className="flex items-center gap-2 text-[12px] text-white">
              <span className="text-neon-emerald">{step.icon}</span>
              {step.title}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">{step.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-white/[0.05] bg-white/[0.015] p-3 text-[12px] text-subtle">
        Current implementation status: this repo has a real authenticated ingest
        endpoint compatible with Health Auto Export style JSON payloads. It is not
        a native HealthKit app yet, and it does not fabricate health values when
        no iPhone sync has occurred.
      </div>
    </GlassCard>
  );
}
