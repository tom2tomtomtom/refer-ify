import { requireRole } from "@/lib/auth";
import { RealTimeJobFeed } from "@/components/jobs/RealTimeJobFeed";

export const dynamic = "force-dynamic";

export default async function FoundingCircleDashboardPage() {
  await requireRole("founding_circle");
  return <RealTimeJobFeed userRole="founding_circle" />;
}