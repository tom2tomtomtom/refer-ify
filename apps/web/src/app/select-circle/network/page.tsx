import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectNetworkCharts } from "@/components/charts/SelectNetworkCharts";

function fmt(n: number) {
  try { return n.toLocaleString(); } catch { return String(n); }
}

export default async function SelectCircleNetworkPage() {
  const supabase = await getSupabaseServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Demo data for demo users
  const isDemo = user.id.startsWith('demo-');
  if (isDemo) {
    const referrals90 = 18;
    const referrals30 = 7;
    const monthlyReferrals = [
      { month: '2024-07', referrals: 2 },
      { month: '2024-08', referrals: 3 },
      { month: '2024-09', referrals: 4 },
      { month: '2024-10', referrals: 3 },
      { month: '2024-11', referrals: 4 },
      { month: '2024-12', referrals: 2 },
    ];

    return (
      <div className="px-4 py-6 md:px-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Network Dashboard</h1>
          <div className="text-sm text-muted-foreground">Track growth, activity, and invitations in your referral network.</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Referrals (90 days)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{fmt(referrals90)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Referrals (30 days)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{fmt(referrals30)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Active Jobs</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">12</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Network Connections</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">45</div></CardContent>
          </Card>
        </div>

        <SelectNetworkCharts monthlyReferrals={monthlyReferrals} />

        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <div className="font-medium">Referred Sarah Chen for VP Engineering</div>
                  <div className="text-xs text-muted-foreground">2 days ago</div>
                </div>
                <div className="text-sm text-green-600">+50 points</div>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <div className="font-medium">Completed profile update</div>
                  <div className="text-xs text-muted-foreground">5 days ago</div>
                </div>
                <div className="text-sm text-blue-600">+10 points</div>
              </div>
              <div className="flex justify-between items-center py-2">
                <div>
                  <div className="font-medium">Referred Michael Johnson for CTO</div>
                  <div className="text-xs text-muted-foreground">7 days ago</div>
                </div>
                <div className="text-sm text-green-600">+50 points</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
              💡 Demo data shown for walkthrough purposes
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Basic metrics from recent referrals and invites (best effort)
  const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const [{ count: referrals90 }, { count: referrals30 }] = await Promise.all([
    supabase.from('referrals').select('id', { count: 'exact', head: true }).match({ referrer_id: user.id as string }).gte('created_at', since90),
    supabase.from('referrals').select('id', { count: 'exact', head: true }).match({ referrer_id: user.id as string }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  // Invitations (if table exists)
  let invites: any[] = [];
  try {
    const { data } = await supabase
      .from('select_circle_invitations' as any)
      .select('id, invited_email, status, sent_at, responded_at')
      .match({ founder_id: user.id as string })
      .order('sent_at', { ascending: false })
      .limit(10);
    invites = (data as any[]) || [];
  } catch {}

  // Network activity (if table exists)
  let activity: any[] = [];
  try {
    const { data } = await supabase
      .from('network_activity' as any)
      .select('id, activity_type, points_earned, created_at')
      .match({ member_id: user.id as string })
      .order('created_at', { ascending: false })
      .limit(10);
    activity = (data as any[]) || [];
  } catch {}

  // Monthly referrals chart
  const monthMap = new Map<string, number>();
  try {
    const { data } = await supabase
      .from('referrals')
      .select('id, created_at')
      .match({ referrer_id: user.id as string })
      .gte('created_at', since90)
      .order('created_at', { ascending: true });
    (data as any[] || []).forEach(r => {
      const dt = new Date(r?.created_at || Date.now());
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) || 0) + 1);
    });
  } catch {}
  const monthlyReferrals = Array.from(monthMap.entries()).sort(([a],[b]) => a.localeCompare(b)).slice(-6).map(([month, referrals]) => ({ month, referrals }));

  // Top connections (derived from activity points)
  const topConnections = activity
    .filter(a => typeof a?.points_earned === 'number')
    .sort((a, b) => (b.points_earned || 0) - (a.points_earned || 0))
    .slice(0, 5);

  return (
    <div className="px-4 py-6 md:px-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Network Dashboard</h1>
        <div className="text-sm text-muted-foreground">Track growth, activity, and invitations in your referral network.</div>
      </div>

      {/* Growth metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Referrals (90 days)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(referrals90 || 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Referrals (30 days)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(referrals30 || 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Invitations (recent)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(invites.length)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Activity (7 days)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(activity.filter(a => Date.now() - new Date(a?.created_at || 0).getTime() < 7*24*60*60*1000).length)}</div></CardContent>
        </Card>
      </div>

      {/* Referrals chart */}
      <SelectNetworkCharts monthlyReferrals={monthlyReferrals} />

      {/* Top connections leaderboard */}
      <Card>
        <CardHeader><CardTitle>Top Connections</CardTitle></CardHeader>
        <CardContent>
          {topConnections.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent high-scoring activity.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Activity</th>
                    <th className="py-2 pr-4">Points</th>
                    <th className="py-2 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {topConnections.map((a, idx) => (
                    <tr key={a.id || idx} className="border-b last:border-none">
                      <td className="py-2 pr-4 capitalize">{a.activity_type?.replace('_',' ') || '—'}</td>
                      <td className="py-2 pr-4">{fmt(a.points_earned || 0)}</td>
                      <td className="py-2 pr-4">{a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitation status tracking */}
      <Card>
        <CardHeader><CardTitle>Invitation Status</CardTitle></CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <div className="text-sm text-muted-foreground">No invitations sent yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Sent</th>
                    <th className="py-2 pr-4">Responded</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((i) => (
                    <tr key={i.id} className="border-b last:border-none">
                      <td className="py-2 pr-4">{i.invited_email}</td>
                      <td className="py-2 pr-4 capitalize">{i.status}</td>
                      <td className="py-2 pr-4">{i.sent_at ? new Date(i.sent_at).toLocaleDateString() : '—'}</td>
                      <td className="py-2 pr-4">{i.responded_at ? new Date(i.responded_at).toLocaleDateString() : '—'}</td>
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


