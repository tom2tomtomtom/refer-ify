import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidatesClient } from "@/components/candidates/CandidatesClient";

function fmt(n: number) { try { return n.toLocaleString(); } catch { return String(n); } }

export default async function CandidatesPage() {
  const supabase = await getSupabaseServerComponentClient();

  const { data: { user } } = await supabase.auth.getUser();
  let role: string | null = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    role = data?.role ?? null;
  }

  const mode: 'referrer' | 'client' = role === 'client' ? 'client' : 'referrer';

  // Metrics filtered by role
  let total = 0, active = 0, hired = 0, avgMatch: number | null = null;
  if (mode === 'referrer' && user) {
    const [{ count: t }, { count: a }, { count: h }, { data: scores }] = await Promise.all([
      supabase.from('referrals').select('id', { count: 'exact', head: true }).eq('referrer_id', user.id),
      supabase.from('referrals').select('id', { count: 'exact', head: true }).eq('referrer_id', user.id).in('status', ['submitted','reviewed','shortlisted']),
      supabase.from('referrals').select('id', { count: 'exact', head: true }).eq('referrer_id', user.id).eq('status','hired'),
      supabase.from('referrals').select('ai_match_score').eq('referrer_id', user.id).not('ai_match_score','is', null),
    ]);
    total = t ?? 0; active = a ?? 0; hired = h ?? 0;
    if (scores && scores.length) {
      const sum = (scores as any[]).reduce((s, r) => s + (Number(r.ai_match_score) || 0), 0);
      avgMatch = Math.round((sum / scores.length) * 10) / 10;
    }
  } else if (mode === 'client' && user) {
    const [{ count: t }, { count: a }, { count: h }, { data: scores }] = await Promise.all([
      supabase.from('referrals').select('id, jobs!inner(client_id)', { count: 'exact', head: true }).eq('jobs.client_id', user.id),
      supabase.from('referrals').select('id, jobs!inner(client_id)', { count: 'exact', head: true }).eq('jobs.client_id', user.id).in('status', ['submitted','reviewed','shortlisted']),
      supabase.from('referrals').select('id, jobs!inner(client_id)', { count: 'exact', head: true }).eq('jobs.client_id', user.id).eq('status','hired'),
      supabase.from('referrals').select('ai_match_score, jobs!inner(client_id)').eq('jobs.client_id', user.id).not('ai_match_score','is', null),
    ]);
    total = t ?? 0; active = a ?? 0; hired = h ?? 0;
    if (scores && scores.length) {
      const sum = (scores as any[]).reduce((s, r) => s + (Number(r.ai_match_score) || 0), 0);
      avgMatch = Math.round((sum / scores.length) * 10) / 10;
    }
  }

  // Initial rows
  let initialRows: any[] = [];
  if (mode === 'referrer' && user) {
    const { data } = await supabase
      .from('referrals')
      .select('id, status, created_at, candidate_email, candidate_name, ai_match_score, job:jobs(title)')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    initialRows = data ?? [];
  } else if (mode === 'client' && user) {
    const { data } = await supabase
      .from('referrals')
      .select('id, status, created_at, candidate_email, candidate_name, ai_match_score, job:jobs!inner(title, client_id)')
      .eq('job.client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    initialRows = data ?? [];
  }

  return (
    <div className="px-4 py-6 md:px-6">
      <div className="text-xs text-muted-foreground mb-2">Dashboard &gt; Candidates</div>
      <h1 className="text-2xl font-bold mb-4">Candidate Management</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm">{mode === 'client' ? 'Candidates for My Jobs' : 'My Referrals'}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{fmt(total)}</div></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm">{mode === 'client' ? 'For Review' : 'Active Pipeline'}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{fmt(active)}</div></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Successful Placements</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{fmt(hired)}</div></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Average Match Score</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{avgMatch === null ? '—' : avgMatch}</div></CardContent></Card>
      </div>

      <CandidatesClient initialCandidates={initialRows} />
    </div>
  );
}


