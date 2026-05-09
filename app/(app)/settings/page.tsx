import { PageHeader } from "@/components/page-header";
import { GlassCard, CardHeader } from "@/components/ui/glass-card";

const integrations = [
  { name: "TickTick", status: "connected", color: "emerald" },
  { name: "Google Calendar", status: "connected", color: "emerald" },
  { name: "Apple Health", status: "ready (placeholder)", color: "amber" },
  { name: "Supabase", status: "configure", color: "blue" },
  { name: "WHOOP / HRV", status: "future", color: "violet" },
];

const toneClass: Record<string, string> = {
  emerald: "border-neon-emerald/30 bg-neon-emerald/10 text-neon-emerald",
  amber: "border-neon-amber/30 bg-neon-amber/10 text-neon-amber",
  blue: "border-neon-blue/30 bg-neon-blue/10 text-neon-blue",
  violet: "border-neon-violet/30 bg-neon-violet/10 text-neon-violet",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Settings"
        title="Personalization"
        description="Connect data sources and tune the calm of your dashboard."
      />
      <GlassCard glow="blue" className="p-5">
        <CardHeader title="Integrations" />
        <div className="mt-4 space-y-2">
          {integrations.map((i) => (
            <div key={i.name} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5">
              <span className="text-[13px] text-white">{i.name}</span>
              <span className={`rounded border px-2 py-0.5 text-[11px] ${toneClass[i.color]}`}>{i.status}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard glow="violet" className="p-5">
        <CardHeader title="Profile" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Name" value="Damian M." />
          <Field label="Program" value="MSc Kinesiology" />
          <Field label="Cycle" value="Med School 2025/26" />
          <Field label="Time zone" value="America/Toronto" />
        </div>
      </GlassCard>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-3">
      <p className="text-[10px] uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-[13px] text-white">{value}</p>
    </div>
  );
}
