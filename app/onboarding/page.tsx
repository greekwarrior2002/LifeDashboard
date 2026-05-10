import { OnboardingWizard } from "@/components/onboarding/wizard";
import { getUser, toPublic } from "@/lib/user-store";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getUser();
  return <OnboardingWizard initialState={toPublic(user)} />;
}
