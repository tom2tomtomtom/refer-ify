import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FoundingRevenueCharts } from "@/components/charts/FoundingRevenueCharts";
import Link from "next/link";
import { ExportRevenueButton } from "@/components/charts/ExportRevenueButton";

function fmt(n: number) {
  try { return `$${Math.round(n).toLocaleString()}`; } catch { return `$${n}`; }
}

type RevRow = { month: string; network_revenue?: number; direct_referrals?: number; advisory_revenue?: number; successful_placements?: number };
type SessionRow = { session_date?: string; duration_hours?: number; hourly_rate?: number; notes?: string | null };

export default async function RevenueDashboardPage() {
  const supabase = await getSupabaseServerComponentClient();

  // Use getCurrentUser which handles both real auth and demo mode
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="px-4 py-6 md:px-6">
        <h1 className="text-2xl font-bold mb-2">Revenue Dashboard</h1>
        <p className="text-sm text-muted-foreground">Please sign in to view revenue analytics.</p>
      </div>
    );
  }

  // Demo data for demo users (check for both old and new demo ID formats)
  const isDemo = user.id.startsWith('demo-') || user.id.startsWith('00000000-0000-0000-0000-');
  if (isDemo) {
    const demoRevenueData: RevRow[] = [
      { month: '2024-07', network_revenue: 45000, direct_referrals: 8000, advisory_revenue: 12000, successful_placements: 3 },
      { month: '2024-08', network_revenue: 52000, direct_referrals: 10000, advisory_revenue: 15000, successful_placements: 4 },
      { month: '2024-09', network_revenue: 61000, direct_referrals: 12000, advisory_revenue: 18000, successful_placements: 5 },
      { month: '2024-10', network_revenue: 73000, direct_referrals: 14000, advisory_revenue: 20000, successful_placements: 6 },
      { month: '2024-11', network_revenue: 85000, direct_referrals: 16000, advisory_revenue: 22000, successful_placements: 7 },
      { month: '2024-12', network_revenue: 98000, direct_referrals: 18000, advisory_revenue: 25000, successful_placements: 8 },
    ];

    const demoSessions: SessionRow[] = [
      { session_date: '2024-12-15', duration_hours: 2, hourly_rate: 500, notes: 'Tech strategy consultation' },
      { session_date: '2024-12-08', duration_hours: 1.5, hourly_rate: 500, notes: 'Leadership coaching' },
      { session_date: '2024-11-22', duration_hours: 3, hourly_rate: 500, notes: 'Product roadmap review' },
    ];

    const latestRevenue = 98000;
    const previousRevenue = 85000;
    const growthRate = ((latestRevenue - previousRevenue) / previousRevenue) * 100;
    const yourShare = latestRevenue * 0.15;
    const advisoryEarnings = 11250;
    const directReferrals = 18000;
    const totalMonthly = yourShare + directReferrals + advisoryEarnings;
    const placementRevenue = 45000;

    const revenueSeries = demoRevenueData.slice(-6).map(r => ({
      month: r.month?.slice(0, 7) ?? '',
      network_revenue: r.network_revenue ?? 0,
      direct_referrals: r.direct_referrals ?? 0,
      advisory_revenue: r.advisory_revenue ?? 0,
    }));

    return (
      <div className="px-4 py-6 md:px-6">
        <div className="text-xs text-muted-foreground mb-2">Dashboard &gt; Founder &gt; Revenue</div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Revenue Dashboard</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><Link href="/founding">Back to Overview</Link></div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Monthly Revenue</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{fmt(totalMonthly)}</div><div className="text-xs text-green-600">+{Math.round(growthRate)}% from last month</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Your 15% Network Share</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{fmt(yourShare)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Advisory Revenue</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{fmt(advisoryEarnings)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Direct Referrals</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{fmt(directReferrals)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Growth Rate</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{Math.round(growthRate)}%</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Projected Annual</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{fmt(totalMonthly * 12)}</div></CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Trends</CardTitle>
              <div className="text-xs"><Link href="/founding/advisory" className="underline">View Advisory Details</Link></div>
            </div>
          </CardHeader>
          <CardContent>
            <FoundingRevenueCharts
              revenueSeries={revenueSeries}
              breakdown={{ networkShare: yourShare, direct: directReferrals, advisory: advisoryEarnings }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Financial Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Month</th>
                    <th className="py-2 pr-4">Network</th>
                    <th className="py-2 pr-4">Direct</th>
                    <th className="py-2 pr-4">Advisory</th>
                    <th className="py-2 pr-4">Success (count)</th>
                  </tr>
                </thead>
                <tbody>
                  {demoRevenueData.slice(-6).map((r) => (
                    <tr key={r.month} className="border-b last:border-none">
                      <td className="py-2 pr-4">{r.month?.slice(0,7)}</td>
                      <td className="py-2 pr-4">{fmt(r.network_revenue ?? 0)}</td>
                      <td className="py-2 pr-4">{fmt(r.direct_referrals ?? 0)}</td>
                      <td className="py-2 pr-4">{fmt(r.advisory_revenue ?? 0)}</td>
                      <td className="py-2 pr-4">{r.successful_placements ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold mb-2">Recent Advisory Sessions (completed)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Hours</th>
                      <th className="py-2 pr-4">Rate</th>
                      <th className="py-2 pr-4">Earnings</th>
                      <th className="py-2 pr-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoSessions.map((s, i) => (
                      <tr key={i} className="border-b last:border-none">
                        <td className="py-2 pr-4">{s.session_date ? new Date(s.session_date).toLocaleDateString() : '—'}</td>
                        <td className="py-2 pr-4">{s.duration_hours ?? 0}</td>
                        <td className="py-2 pr-4">{fmt(s.hourly_rate ?? 500)}</td>
                        <td className="py-2 pr-4">{fmt((s.duration_hours ?? 0) * (s.hourly_rate ?? 500))}</td>
                        <td className="py-2 pr-4">{s.notes ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 text-sm">
              <div className="font-semibold">Placement Success (last 6 months)</div>
              <div className="text-muted-foreground">Estimated founding share from hires: {fmt(placementRevenue)}</div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
              💡 Demo data shown for walkthrough purposes
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  let revenueData: RevRow[] = [];
  let completedSessions: SessionRow[] = [];
  let successfulReferrals: any[] = [];

  try {
    const { data } = await supabase
      .from('founding_metrics')
      .select('month, network_revenue, direct_referrals, advisory_revenue, successful_placements')
      .eq('user_id', user.id)
      .order('month', { ascending: true });
    revenueData = (data as RevRow[]) ?? [];
  } catch {}

  try {
    const { data } = await supabase
      .from('advisory_sessions')
      .select('session_date, duration_hours, rate_per_hour:hourly_rate, notes, status, founder_id')
      .eq('founder_id', user.id)
      .eq('status', 'completed');
    // Map alias for typing consistency
    completedSessions = ((data as any[]) ?? []).map(r => ({ session_date: r.session_date, duration_hours: r.duration_hours, hourly_rate: r.rate_per_hour, notes: r.notes })) as SessionRow[];
  } catch {}

  try {
    const sixMonthsAgoISO = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('referrals')
      .select('id, status, created_at, job:jobs(id, title, salary_min, salary_max)')
      .eq('referrer_id', user.id)
      .eq('status', 'hired')
      .gte('created_at', sixMonthsAgoISO);
    successfulReferrals = (data as any[]) ?? [];
  } catch {}

  const latestRevenue = revenueData.at(-1)?.network_revenue ?? 0;
  const previousRevenue = revenueData.at(-2)?.network_revenue ?? 0;
  const growthRate = previousRevenue ? ((latestRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const yourShare = latestRevenue * 0.15;

  const advisoryEarnings = (completedSessions ?? []).reduce((t, s) => t + ((s.duration_hours || 0) * (s.hourly_rate || 500)), 0);
  const directReferrals = revenueData.at(-1)?.direct_referrals ?? 0;

  const placementRevenue = (successfulReferrals ?? []).reduce((total, r) => {
    const job = r?.job;
    const min = Number(job?.salary_min) || 150000;
    const max = Number(job?.salary_max) || min;
    const avg = (min + max) / 2;
    const placementFee = avg * 0.275; // 27.5%
    return total + (placementFee * 0.15); // 15% share
  }, 0);

  const totalMonthly = yourShare + directReferrals + advisoryEarnings; // immediate streams shown

  const revenueSeries = (revenueData ?? []).slice(-6).map(r => ({
    month: r.month?.slice(0, 7) ?? '',
    network_revenue: r.network_revenue ?? 0,
    direct_referrals: r.direct_referrals ?? 0,
    advisory_revenue: r.advisory_revenue ?? 0,
  }));

  return (
    <div className="px-4 py-6 md:px-6">
      <div className="text-xs text-muted-foreground mb-2">Dashboard &gt; Founding Circle &gt; Revenue</div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Revenue Dashboard</h1>
        <div className="flex items-center gap-3 text-xs text-muted-foreground"><Link href="/founding">Back to Overview</Link></div>
        <div className="flex gap-2">
          <ExportRevenueButton revenueSeries={revenueSeries} sessions={completedSessions} />
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Monthly Revenue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(totalMonthly)}</div><div className="text-xs text-green-600">{growthRate >= 0 ? '+' : ''}{Math.round(growthRate)}% from last month</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Your 15% Network Share</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(yourShare)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Advisory Revenue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(advisoryEarnings)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Direct Referrals</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(directReferrals)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Growth Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{previousRevenue ? `${Math.round(growthRate)}%` : '—'}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Projected Annual</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(totalMonthly * 12)}</div></CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Revenue Trends</CardTitle>
            <div className="text-xs"><Link href="/founding/advisory" className="underline">View Advisory Details</Link></div>
          </div>
        </CardHeader>
        <CardContent>
          <FoundingRevenueCharts
            revenueSeries={revenueSeries}
            breakdown={{ networkShare: yourShare, direct: directReferrals, advisory: advisoryEarnings }}
          />
        </CardContent>
      </Card>

      {/* Financial Performance Table */}
      <Card>
        <CardHeader><CardTitle>Financial Performance</CardTitle></CardHeader>
        <CardContent>
          {revenueData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No revenue data available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Month</th>
                    <th className="py-2 pr-4">Network</th>
                    <th className="py-2 pr-4">Direct</th>
                    <th className="py-2 pr-4">Advisory</th>
                    <th className="py-2 pr-4">Success (count)</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.slice(-6).map((r) => (
                    <tr key={r.month} className="border-b last:border-none">
                      <td className="py-2 pr-4">{r.month?.slice(0,7)}</td>
                      <td className="py-2 pr-4">{fmt(r.network_revenue ?? 0)}</td>
                      <td className="py-2 pr-4">{fmt(r.direct_referrals ?? 0)}</td>
                      <td className="py-2 pr-4">{fmt(r.advisory_revenue ?? 0)}</td>
                      <td className="py-2 pr-4">{r.successful_placements ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Advisory sessions summary */}
          <div className="mt-6">
            <div className="text-sm font-semibold mb-2">Recent Advisory Sessions (completed)</div>
            {completedSessions.length === 0 ? (
              <div className="text-sm text-muted-foreground">No completed sessions.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Hours</th>
                      <th className="py-2 pr-4">Rate</th>
                      <th className="py-2 pr-4">Earnings</th>
                      <th className="py-2 pr-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedSessions.slice(-6).map((s, i) => (
                      <tr key={i} className="border-b last:border-none">
                        <td className="py-2 pr-4">{s.session_date ? new Date(s.session_date).toLocaleDateString() : '—'}</td>
                        <td className="py-2 pr-4">{s.duration_hours ?? 0}</td>
                        <td className="py-2 pr-4">{fmt(s.hourly_rate ?? 500)}</td>
                        <td className="py-2 pr-4">{fmt((s.duration_hours ?? 0) * (s.hourly_rate ?? 500))}</td>
                        <td className="py-2 pr-4">{s.notes ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Placement revenue */}
          <div className="mt-6 text-sm">
            <div className="font-semibold">Placement Success (last 6 months)</div>
            <div className="text-muted-foreground">Estimated founding share from hires: {fmt(placementRevenue)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


