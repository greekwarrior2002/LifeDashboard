import { PageHeader } from "@/components/page-header";
import { SettingsClient } from "@/components/settings-client";
import { getUser, toPublic } from "@/lib/user-store";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getUser();
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Settings"
        title="Personalization"
        description="Connect data sources, edit your profile, and tune your dashboard."
      />
      <SettingsClient initialState={toPublic(user)} />
    </div>
  );
}
