import { PageHeader } from "@/components/page-header";
import { RecoveryHealth } from "@/components/cards/recovery-health";
import { SleepConsistency } from "@/components/cards/sleep-consistency";
import { LifeBalance } from "@/components/cards/life-balance";
import { HealthSetupPanel } from "@/components/health-setup-panel";
import { readHealthSamples } from "@/lib/health-store";
import { getUser } from "@/lib/user-store";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const user = await getUser();
  const samples = await readHealthSamples();
  const connected = !!user.integrations.apple_health;

  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Health"
        title="Recovery & Biometrics"
        description={
          connected
            ? "Connected · Apple Health is pushing sleep, HRV, steps, and workouts to this dashboard."
            : "Sleep, HRV, training load, stress, and life balance — connect Apple Health from Settings to start syncing real data."
        }
      />
      <div className="grid gap-5 md:grid-cols-2">
        <RecoveryHealth />
        <SleepConsistency />
      </div>
      <HealthSetupPanel connected={connected} lastSync={samples.lastIngest?.at} />
      <LifeBalance />
    </div>
  );
}
