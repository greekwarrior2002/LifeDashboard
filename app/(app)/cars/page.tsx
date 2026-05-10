import { PageHeader } from "@/components/page-header";
import { GarageClient } from "@/components/garage-client";

export const dynamic = "force-dynamic";

export default function CarsPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <PageHeader
        eyebrow="Garage"
        title="Vehicles & Maintenance"
        description="Track real service history, mileage, receipts, and upcoming maintenance for each car."
      />
      <GarageClient mode="page" />
    </div>
  );
}
