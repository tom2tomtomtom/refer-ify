import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MyReferralsCharts } from "@/components/charts/MyReferralsCharts";

function fmt(n: number) {
  try { return `$${Math.round(n).toLocaleString()}`; } catch { return `$${n}`; }
}

export default async function MyReferralsDashboardPage() {
  const supabase = await getSupabaseServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="px-4 py-6 md:px-6">
        <h1 className="text-2xl font-bold mb-2">My Referrals Dashboard</h1>
        <p className="text-sm text-muted-foreground">Please sign in to view your referrals and earnings.</p>
      </div>
    );
  }

  // Role-based access: clients should not use referrals dashboard
  try {
    const { data: profile } = await supabase.from("profiles").select("role").match({ id: user.id as string }).single();
    const role = (profile as any)?.role ?? null;
    if (role === 'client') {
      redirect('/candidates');
    }
  } catch {}

  // Build absolute URL for server-side fetch
  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const dashboardRes = await fetch(`${origin}/api/referrals/my-dashboard`, { cache: 'no-store' });
  const dashboard: any = await dashboardRes.json();

  return (
    <div className="px-4 py-6 md:px-6">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Referrals Dashboard</h1>
        <div className="text-sm text-muted-foreground">Track your referral earnings, pipeline, and performance.</div>
      </div>

      {/* Top metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Earnings</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-700">{fmt(dashboard?.metrics?.totalEarnings || 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pipeline Value</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(dashboard?.metrics?.pipelineValue || 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Success Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{Math.round(dashboard?.metrics?.successRate || 0)}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">This Month</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-700">{fmt(dashboard?.metrics?.thisMonthEarnings || 0)}</div></CardContent>
        </Card>
      </div>

      {/* Charts */}
      <MyReferralsCharts
        earningsSeries={dashboard?.charts?.earningsSeries || []}
        pipelineCounts={dashboard?.charts?.pipelineCounts || {}}
        performanceComparison={dashboard?.charts?.performanceComparison || { you: 0, networkAverage: 0 }}
      />

      {/* Pipeline board */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Referral Pipeline</h2>
          <form action="/api/referrals/export-earnings" method="post">
            <Button type="submit" variant="outline">Export Earnings CSV</Button>
          </form>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {['submitted','reviewed','shortlisted','interviewing','hired','rejected'].map((col) => (
            <Card key={col} className="bg-gradient-to-b from-white to-gray-50">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium capitalize">{col}</CardTitle></CardHeader>
              <CardContent>
                {(dashboard?.pipeline || []).filter((p: any) => p.status === col).slice(0, 8).map((p: any) => (
                  <div key={p.id} className="mb-3 rounded border p-2 text-xs">
                    <div className="font-semibold">{p.candidateName} <span className="text-muted-foreground">{p.candidateTitle ? `· ${p.candidateTitle}` : ''}</span></div>
                    <div className="text-muted-foreground">{p.jobTitle}</div>
                    <div className="mt-1"><span className="text-green-700 font-medium">Potential: {fmt(p.potentialEarnings || 0)}</span></div>
                    <div className="text-[11px] text-muted-foreground">{p.daysInStatus} days in status</div>
                    <div className="mt-2 flex gap-2">
                      <Link href={`/candidates/${p.candidateId || p.id}`} className="underline">View</Link>
                      <Link href={`/candidates/${p.candidateId || p.id}`} className="underline">Notes</Link>
                      <Link href={`/candidates/${p.candidateId || p.id}`} className="underline">Follow up</Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Advanced analytics & goals */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Performance Analytics</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-muted-foreground">Best Industries</div>
                <ul className="mt-1 list-disc pl-4">
                  {/* Placeholder: would source from /api/referrals/analytics */}
                  <li>Enterprise SaaS</li>
                  <li>Fintech</li>
                  <li>Healthtech</li>
                </ul>
              </div>
              <div>
                <div className="text-muted-foreground">Avg Time to Hire</div>
                <div className="text-2xl font-bold">— days</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Goals & Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm">Monthly Goal</div>
            <div className="w-full bg-gray-100 h-2 rounded">
              <div className="bg-green-600 h-2 rounded" style={{ width: `${Math.min(100, Math.round(((dashboard?.metrics?.thisMonthEarnings || 0) / Math.max(1, dashboard?.goals?.[0]?.target || 1)) * 100))}%` }} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">{fmt(dashboard?.metrics?.thisMonthEarnings || 0)} / {fmt(dashboard?.goals?.[0]?.target || 0)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


