import { requireRole } from "@/lib/auth";
import { RealTimeJobFeed } from "@/components/jobs/RealTimeJobFeed";

export const dynamic = "force-dynamic";

export default async function SelectCircleDashboardPage() {
  await requireRole("select_circle");
  return (
    <div>
      <h1 className="sr-only">Opportunity Board</h1>
      <RealTimeJobFeed userRole="select_circle" />
    </div>
  );
}