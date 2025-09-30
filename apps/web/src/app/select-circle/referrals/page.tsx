import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuickReferralForm } from "@/components/referrals/QuickReferralForm";

function fmtCurrency(n: number) {
  try { return `$${Math.round(n).toLocaleString()}`; } catch { return `$${n}`; }
}

export default async function SelectCircleReferralsPage() {
  const supabase = await getSupabaseServerComponentClient();
  const user = await getCurrentUser();
  if (!user) return null;

  // Demo data for demo users
  const isDemo = user.id.startsWith('demo-') || user.id.startsWith('00000000-0000-0000-0000-');
  if (isDemo) {
    const totalEarnings = 48500;
    const successRate = 65;
    const pipeline = [
      { id: '1', candidateName: 'Sarah Chen', jobTitle: 'VP Engineering', status: 'hired', potentialEarnings: 12000, daysInStatus: 45 },
      { id: '2', candidateName: 'Michael Johnson', jobTitle: 'CTO', status: 'interviewing', potentialEarnings: 15000, daysInStatus: 12 },
      { id: '3', candidateName: 'Emily Rodriguez', jobTitle: 'Head of Design', status: 'shortlisted', potentialEarnings: 8500, daysInStatus: 8 },
      { id: '4', candidateName: 'David Kim', jobTitle: 'Director of Product', status: 'reviewed', potentialEarnings: 9000, daysInStatus: 5 },
      { id: '5', candidateName: 'Lisa Wang', jobTitle: 'Senior Engineer', status: 'submitted', potentialEarnings: 6000, daysInStatus: 2 },
    ];

    return (
      <div className="px-4 py-6 md:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Referrals</h1>
            <div className="text-sm text-muted-foreground">Track your referrals, statuses, and earnings.</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><a href="/select-circle/earnings">View Earnings</a></Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Total Earnings</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-700">{fmtCurrency(totalEarnings)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Success Rate</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{successRate}%</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Referrals</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{pipeline.length}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>My Referral Submissions</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Candidate</th>
                    <th className="py-2 pr-4">Job</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Potential</th>
                    <th className="py-2 pr-4">Days</th>
                  </tr>
                </thead>
                <tbody>
                  {pipeline.map((p) => (
                    <tr key={p.id} className="border-b last:border-none">
                      <td className="py-2 pr-4">{p.candidateName}</td>
                      <td className="py-2 pr-4">{p.jobTitle}</td>
                      <td className="py-2 pr-4 capitalize">{p.status}</td>
                      <td className="py-2 pr-4 text-green-700">{fmtCurrency(p.potentialEarnings)}</td>
                      <td className="py-2 pr-4">{p.daysInStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
              💡 Demo data shown for walkthrough purposes
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const [dashboardRes, profileRes] = await Promise.all([
    fetch(`${origin}/api/referrals/my-dashboard`, { cache: 'no-store' }),
    supabase.from('profiles').select('role').match({ id: user.id as string }).single(),
  ]);
  const dashboard = await dashboardRes.json();
  const role = (profileRes.data as any)?.role ?? null;

  const totalEarnings = dashboard?.metrics?.totalEarnings || 0;
  const successRate = dashboard?.metrics?.successRate || 0;

  // Filters (server-side placeholder)
  const pipeline = (dashboard?.pipeline || []) as any[];

  return (
    <div className="px-4 py-6 md:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Referrals</h1>
          <div className="text-sm text-muted-foreground">Track your referrals, statuses, and earnings.</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><a href="/select-circle/earnings">View Earnings</a></Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Earnings</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-700">{fmtCurrency(totalEarnings)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Success Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{Math.round(successRate)}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Referrals</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{pipeline.length}</div></CardContent>
        </Card>
      </div>

      {/* Quick submission */}
      <Card>
        <CardHeader><CardTitle>Submit a Referral</CardTitle></CardHeader>
        <CardContent>
          <QuickReferralForm />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <select className="rounded border p-2 text-sm">
              <option value="">All Statuses</option>
              {['submitted','reviewed','shortlisted','interviewing','hired','rejected'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input type="date" className="rounded border p-2 text-sm" />
            <input type="text" className="rounded border p-2 text-sm" placeholder="Job title" />
          </div>
        </CardContent>
      </Card>

      {/* Referrals list */}
      <Card>
        <CardHeader><CardTitle>My Referral Submissions</CardTitle></CardHeader>
        <CardContent>
          {pipeline.length === 0 ? (
            <div className="text-sm text-muted-foreground">No referrals yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Candidate</th>
                    <th className="py-2 pr-4">Job</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Potential</th>
                    <th className="py-2 pr-4">Days</th>
                  </tr>
                </thead>
                <tbody>
                  {pipeline.map((p) => (
                    <tr key={p.id} className="border-b last:border-none">
                      <td className="py-2 pr-4">{p.candidateName}</td>
                      <td className="py-2 pr-4">{p.jobTitle}</td>
                      <td className="py-2 pr-4 capitalize">{p.status}</td>
                      <td className="py-2 pr-4 text-green-700">{fmtCurrency(p.potentialEarnings || 0)}</td>
                      <td className="py-2 pr-4">{p.daysInStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



