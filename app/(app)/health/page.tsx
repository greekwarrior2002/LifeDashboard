import { PageHeader } from "@/components/page-header";
import { RecoveryHealth } from "@/components/cards/recovery-health";
import { SleepConsistency } from "@/components/cards/sleep-consistency";
import { LifeBalance } from "@/components/cards/life-balance";
import { getUser } from "@/lib/user-store";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const user = await getUser();
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
      <div className="grid gap-5 lg:grid-cols-2">
        <RecoveryHealth />
        <SleepConsistency />
      </div>
      <LifeBalance />
    </div>
  );
}
