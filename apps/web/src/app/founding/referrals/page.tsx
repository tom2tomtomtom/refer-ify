import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MyReferralsClient } from "@/components/referrals/MyReferralsClient";

function fmt(n: number) { try { return `$${Math.round(n).toLocaleString()}`; } catch { return `$${n}`; } }

export default async function FoundingReferralsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Demo data for demo users
  const isDemo = user.id.startsWith('demo-') || user.id.startsWith('00000000-0000-0000-0000-');
  if (isDemo) {
    const demoReferrals = [
      { id: '1', candidate_email: 'alex.thompson@example.com', status: 'hired', ai_match_score: 92, created_at: '2024-10-15T10:00:00Z', job: { id: '1', title: 'Senior Full-Stack Engineer', subscription_tier: 'priority', salary_min: 160000, salary_max: 220000 } },
      { id: '2', candidate_email: 'jessica.white@example.com', status: 'interviewing', ai_match_score: 88, created_at: '2024-11-01T14:30:00Z', job: { id: '2', title: 'Senior Product Designer', subscription_tier: 'connect', salary_min: 140000, salary_max: 190000 } },
      { id: '3', candidate_email: 'kevin.harris@example.com', status: 'shortlisted', ai_match_score: 85, created_at: '2024-11-10T09:15:00Z', job: { id: '3', title: 'Senior Data Engineer', subscription_tier: 'connect', salary_min: 165000, salary_max: 220000 } },
      { id: '4', candidate_email: 'rachel.clark@example.com', status: 'reviewed', ai_match_score: 82, created_at: '2024-11-20T16:45:00Z', job: { id: '4', title: 'Senior Product Manager', subscription_tier: 'connect', salary_min: 150000, salary_max: 200000 } },
      { id: '5', candidate_email: 'brandon.lewis@example.com', status: 'submitted', ai_match_score: 79, created_at: '2024-12-01T11:20:00Z', job: { id: '5', title: 'Senior DevOps Engineer', subscription_tier: 'priority', salary_min: 170000, salary_max: 230000 } },
    ];

    const totalEarnings = 27000; // 15% of hired placement fee

    return (
      <div className="px-4 py-6 md:px-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Referrals (Founding)</h1>
          <div className="text-sm text-muted-foreground">Track your network-driven referrals and earnings (15% share).</div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Referrals</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{demoReferrals.length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Hired</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{demoReferrals.filter(r => r.status === 'hired').length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Earnings (Hired)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-700">{fmt(totalEarnings)}</div></CardContent></Card>
        </div>

        <MyReferralsClient initialReferrals={demoReferrals} earningsShare={0.15} />
      </div>
    );
  }

  const supabase = await getSupabaseServerComponentClient();

  // All referrals by this founding member
  const { data: rows } = await supabase
    .from('referrals')
    .select('id, candidate_email, status, ai_match_score, created_at, job:jobs(id, title, subscription_tier, salary_min, salary_max)')
    .match({ referrer_id: user.id as string })
    .order('created_at', { ascending: false });

  const referrals = (rows as any[]) || [];

  // Earnings (Founding share = 15%)
  function estimatePlacementFee(min?: number | null, max?: number | null) {
    const a = Number(min ?? 0) || 0; const b = Number(max ?? 0) || a; const avg = a && b ? (a + b) / 2 : a || b || 0; return avg * 0.20;
  }
  const totalEarnings = referrals.reduce((t, r) => {
    if (r?.status !== 'hired') return t;
    const job = Array.isArray(r?.job) ? r.job[0] : r?.job;
    const fee = estimatePlacementFee(job?.salary_min, job?.salary_max);
    return t + (fee * 0.15);
  }, 0);

  return (
    <div className="px-4 py-6 md:px-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Referrals (Founding)</h1>
        <div className="text-sm text-muted-foreground">Track your network-driven referrals and earnings (15% share).</div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Referrals</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{referrals.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Hired</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{referrals.filter(r => r?.status === 'hired').length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Earnings (Hired)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-700">{fmt(totalEarnings)}</div></CardContent></Card>
      </div>

      {/* Filterable list with founding earnings share */}
      <MyReferralsClient initialReferrals={(referrals || []).map(r => ({
        id: r.id,
        candidate_email: r.candidate_email,
        status: r.status,
        ai_match_score: r.ai_match_score,
        created_at: r.created_at,
        job: Array.isArray(r?.job) ? r.job[0] : r?.job,
      }))} earningsShare={0.15} />
    </div>
  );
}

