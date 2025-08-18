import { requireRole } from "@/lib/auth";
import { RealTimeJobFeed } from "@/components/jobs/RealTimeJobFeed";

export const dynamic = "force-dynamic";

export default async function SelectCircleDashboardPage() {
  await requireRole("select_circle");
  return <RealTimeJobFeed userRole="select_circle" />;
}