export const dynamic = "force-dynamic";
import { requireRole } from "@/lib/auth";
import Link from "next/link";

export default async function JobAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("client");
  const { id } = await params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/analytics/jobs/${id}`, { cache: 'no-store' });
  const data = await res.json();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Job Analytics</h1>
        <Link href={`/client/jobs/${id}`} className="text-blue-600 hover:text-blue-800">← Back to Job</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white p-4 rounded border">
          <div className="text-xs text-muted-foreground">Submitted</div>
          <div className="text-xl font-semibold">{data?.pipelineCounts?.submitted ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded border">
          <div className="text-xs text-muted-foreground">Reviewed</div>
          <div className="text-xl font-semibold">{data?.pipelineCounts?.reviewed ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded border">
          <div className="text-xs text-muted-foreground">Shortlisted</div>
          <div className="text-xl font-semibold">{data?.pipelineCounts?.shortlisted ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded border">
          <div className="text-xs text-muted-foreground">Hired</div>
          <div className="text-xl font-semibold">{data?.pipelineCounts?.hired ?? 0}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded border">
        <div className="text-sm text-muted-foreground">Avg time to hire (days)</div>
        <div className="text-2xl font-semibold">{data?.avgTimeToHire ?? 0}</div>
      </div>
    </div>
  );
}

