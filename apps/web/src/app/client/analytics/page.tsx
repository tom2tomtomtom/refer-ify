export const dynamic = "force-dynamic";
import { requireRole } from "@/lib/auth";

export default async function ClientAnalyticsPage() {
  const { user } = await requireRole("client");

  // Use demo data or fetch real data
  let data: any;
  
  if (user.id.startsWith('demo-') || user.id.startsWith('00000000-0000-0000-0000-')) {
    // Demo analytics data for client
    data = {
      pipelineCounts: {
        submitted: 47,
        reviewed: 31,
        interviewed: 18,
        hired: 8
      },
      avgTimeToHire: 23,
      topPerformers: [
        { name: 'Jennifer M.', referrals: 12, hires: 3 },
        { name: 'Robert S.', referrals: 8, hires: 2 },
        { name: 'Anna L.', referrals: 6, hires: 2 }
      ],
      monthlyTrends: [
        { month: 'Nov', referrals: 15, hires: 3 },
        { month: 'Dec', referrals: 22, hires: 4 },
        { month: 'Jan', referrals: 18, hires: 2 }
      ]
    };
  } else {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/analytics/client`, { cache: 'no-store' });
      data = await res.json();
    } catch (error) {
      // Fallback to empty data if API fails
      data = {
        pipelineCounts: { submitted: 0, reviewed: 0, interviewed: 0, hired: 0 },
        avgTimeToHire: 0,
        topPerformers: [],
        monthlyTrends: []
      };
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Client Analytics</h1>
        <p className="text-gray-600">Track your recruitment performance and ROI</p>
      </div>

      {/* Pipeline Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Referrals Submitted</div>
          <div className="text-2xl font-bold text-blue-600">{data?.pipelineCounts?.submitted ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Under Review</div>
          <div className="text-2xl font-bold text-yellow-600">{data?.pipelineCounts?.reviewed ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Interviewed</div>
          <div className="text-2xl font-bold text-purple-600">{data?.pipelineCounts?.interviewed ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Successfully Hired</div>
          <div className="text-2xl font-bold text-green-600">{data?.pipelineCounts?.hired ?? 0}</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-500 mb-2">Average Time to Hire</div>
          <div className="text-3xl font-bold">{data?.avgTimeToHire ?? 0}</div>
          <div className="text-sm text-gray-500">days</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-500 mb-2">Conversion Rate</div>
          <div className="text-3xl font-bold">
            {data?.pipelineCounts?.submitted ? Math.round((data.pipelineCounts.hired / data.pipelineCounts.submitted) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-500">referrals to hires</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-500 mb-2">Cost per Hire</div>
          <div className="text-3xl font-bold">$12,500</div>
          <div className="text-sm text-gray-500">vs industry avg $18,000</div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Top Referring Network Members</h2>
        <div className="space-y-3">
          {(data?.topPerformers || []).map((performer: any, index: number) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                  {performer.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <span className="font-medium">{performer.name}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{performer.hires} hires</div>
                <div className="text-sm text-gray-500">{performer.referrals} referrals</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Monthly Performance</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(data?.monthlyTrends || []).map((trend: any, index: number) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-lg">{trend.month}</div>
              <div className="text-2xl font-bold text-blue-600">{trend.referrals}</div>
              <div className="text-sm text-gray-600">referrals</div>
              <div className="text-lg font-semibold text-green-600">{trend.hires}</div>
              <div className="text-sm text-gray-600">hires</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

