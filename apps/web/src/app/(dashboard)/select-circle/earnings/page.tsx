import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SelectEarningsCharts } from "@/components/charts/SelectEarningsCharts";

function fmtCurrency(n: number) {
  try { return `$${Math.round(n).toLocaleString()}`; } catch { return `$${n}`; }
}

function estimatePlacementFee(salaryMin?: number | null, salaryMax?: number | null) {
  const min = Number(salaryMin ?? 0) || 0;
  const max = Number(salaryMax ?? 0) || min;
  const avg = max && min ? (min + max) / 2 : min || max || 0;
  return avg * 0.20; // 20% standard placement fee
}

export default async function SelectCircleEarningsPage() {
  const supabase = await getSupabaseServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Determine role and early return if not select/founding (circle members)
  let role: string | null = null;
  try {
    const { data: profile } = await supabase.from("profiles").select("role").match({ id: user.id as string }).single();
    role = (profile as any)?.role ?? null;
  } catch {}

  // Fetch referrals (hired and in-pipeline) to compute earnings and breakdowns
  const sinceSixMonths = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
  const { data: hired } = await supabase
    .from('referrals')
    .select('id, status, created_at, job:jobs(id, title, salary_min, salary_max)')
    .match({ referrer_id: user.id as string })
    .eq('status','hired')
    .gte('created_at', sinceSixMonths)
    .order('created_at', { ascending: true });

  const { data: allRecent } = await supabase
    .from('referrals')
    .select('id, status, created_at, job:jobs(id, title, salary_min, salary_max)')
    .match({ referrer_id: user.id as string })
    .gte('created_at', sinceSixMonths)
    .order('created_at', { ascending: true });

  // Attempt to fetch payment distributions (paid history)
  let distributions: any[] = [];
  try {
    const { data } = await supabase
      .from('revenue_distributions' as any)
      .select('id, referral_id, placement_fee, select_share, status, paid_at')
      .match({ select_member_id: user.id as string })
      .order('paid_at', { ascending: false });
    distributions = (data as any[]) || [];
  } catch {}

  // Monthly earnings (last 6 months)
  const monthMap = new Map<string, number>();
  (hired as any[] || []).forEach((r) => {
    const job = Array.isArray(r?.job) ? r.job[0] : r?.job;
    const fee = estimatePlacementFee(job?.salary_min, job?.salary_max);
    const share = 0.40; // Select Circle share of placement fee
    const earn = fee * share;
    const dt = new Date(r?.created_at || Date.now());
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(key, (monthMap.get(key) || 0) + earn);
  });
  const earningsSeries = Array.from(monthMap.entries())
    .sort(([a],[b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, earnings]) => ({ month, earnings }));

  // Referral success breakdown
  const pendingCount = (allRecent as any[] || []).filter(r => ['submitted','reviewed','shortlisted','interviewing'].includes(r?.status)).length;
  const successfulCount = (allRecent as any[] || []).filter(r => r?.status === 'hired').length;
  const paidCount = (distributions || []).filter(d => d?.status === 'paid').length;
  const breakdown = [
    { label: 'Pending', value: pendingCount },
    { label: 'Successful', value: successfulCount },
    { label: 'Paid', value: paidCount },
  ];

  // Top performing referrals (by earnings amount)
  const topReferrals = ((hired as any[]) || [])
    .map(r => {
      const job = Array.isArray(r?.job) ? r.job[0] : r?.job;
      const fee = estimatePlacementFee(job?.salary_min, job?.salary_max);
      const earn = fee * 0.40;
      return { id: r.id, title: job?.title || '—', estimatedEarnings: earn, date: r?.created_at };
    })
    .sort((a, b) => b.estimatedEarnings - a.estimatedEarnings)
    .slice(0, 5);

  // Payment history rows
  const payments = (distributions || []).map(d => ({
    id: d?.id,
    date: d?.paid_at ? new Date(d.paid_at).toLocaleDateString() : '—',
    amount: typeof d?.select_share === 'number' ? d.select_share : Math.round((d?.placement_fee || 0) * 0.40),
    status: d?.status || 'calculated',
  })).slice(0, 8);

  // YTD Summary
  const currentYear = new Date().getFullYear();
  const ytdEarned = ((hired as any[]) || []).reduce((t, r) => {
    const dt = new Date(r?.created_at || Date.now());
    if (dt.getFullYear() !== currentYear) return t;
    const job = Array.isArray(r?.job) ? r.job[0] : r?.job;
    const fee = estimatePlacementFee(job?.salary_min, job?.salary_max);
    return t + (fee * 0.40);
  }, 0);
  const ytdPaid = (distributions || []).reduce((t, d) => {
    const dt = d?.paid_at ? new Date(d.paid_at) : null;
    if (dt && dt.getFullYear() === currentYear && d?.status === 'paid') return t + (d?.select_share || 0);
    return t;
  }, 0);
  const ytdPending = Math.max(0, ytdEarned - ytdPaid);

  return (
    <div className="px-4 py-6 md:px-6 space-y-6">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Earnings Dashboard</h1>
          <div className="text-sm text-muted-foreground">Select Circle earnings overview and payment history.</div>
        </div>
        <div className="flex gap-2">
          <Link href="/select-circle/referrals"><Button variant="outline">View My Referrals</Button></Link>
        </div>
      </div>

      {/* YTD summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">YTD Earned</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-700">{fmtCurrency(ytdEarned)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">YTD Paid</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmtCurrency(ytdPaid)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Pending Payout</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmtCurrency(ytdPending)}</div></CardContent>
        </Card>
      </div>

      {/* Charts */}
      <SelectEarningsCharts earningsSeries={earningsSeries} breakdown={breakdown} />

      {/* Top performing referrals */}
      <Card>
        <CardHeader><CardTitle>Top Performing Referrals</CardTitle></CardHeader>
        <CardContent>
          {(topReferrals || []).length === 0 ? (
            <div className="text-sm text-muted-foreground">No successful referrals yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Referral</th>
                    <th className="py-2 pr-4">Estimated Earnings</th>
                    <th className="py-2 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {topReferrals.map((r) => (
                    <tr key={r.id} className="border-b last:border-none">
                      <td className="py-2 pr-4">{r.title}</td>
                      <td className="py-2 pr-4 text-green-700">{fmtCurrency(r.estimatedEarnings)}</td>
                      <td className="py-2 pr-4">{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment history */}
      <Card>
        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
        <CardContent>
          {(payments || []).length === 0 ? (
            <div className="text-sm text-muted-foreground">No payment records yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, idx) => (
                    <tr key={p.id || idx} className="border-b last:border-none">
                      <td className="py-2 pr-4">{p.date}</td>
                      <td className="py-2 pr-4">{fmtCurrency(p.amount || 0)}</td>
                      <td className="py-2 pr-4 capitalize">{p.status}</td>
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


