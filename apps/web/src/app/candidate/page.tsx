export const dynamic = "force-dynamic";
import { requireRole } from "@/lib/auth";

export default async function CandidateDashboardPage() {
  await requireRole("candidate");
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Candidate Dashboard</h1>
    </div>
  );
}


