import { PageHeader } from "@/components/page-header";
import { RecoveryHealth } from "@/components/cards/recovery-health";
import { SleepConsistency } from "@/components/cards/sleep-consistency";
import { LifeBalance } from "@/components/cards/life-balance";

export default function HealthPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Health"
        title="Recovery & Biometrics"
        description="Sleep, HRV, training load, stress, and life balance — designed to plug into Apple Health when ready."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <RecoveryHealth />
        <SleepConsistency />
      </div>
      <LifeBalance />
    </div>
  );
}
