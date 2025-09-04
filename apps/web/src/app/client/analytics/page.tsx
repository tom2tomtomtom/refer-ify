export const dynamic = "force-dynamic";
import { requireRole } from "@/lib/auth";

export default async function ClientAnalyticsPage() {
  await requireRole("client");

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/analytics/client`, { cache: 'no-store' });
  const data = await res.json();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white p-4 rounded border">
          <div className="text-sm text-muted-foreground">Submitted</div>
          <div className="text-2xl font-semibold">{data?.pipelineCounts?.submitted ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded border">
          <div className="text-sm text-muted-foreground">Reviewed</div>
          <div className="text-2xl font-semibold">{data?.pipelineCounts?.reviewed ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded border">
          <div className="text-sm text-muted-foreground">Hired</div>
          <div className="text-2xl font-semibold">{data?.pipelineCounts?.hired ?? 0}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded border">
        <div className="text-sm text-muted-foreground">Avg time to hire (days)</div>
        <div className="text-2xl font-semibold">{data?.avgTimeToHire ?? 0}</div>
      </div>
    </div>
  );
}

