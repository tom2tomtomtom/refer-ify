import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

function fmt(n: number) {
  try { return n.toLocaleString(); } catch { return String(n); }
}

export default async function ClientCandidatesPage() {
  const supabase = await getSupabaseServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Metrics
  const [totalRes, pendingRes, interviewingRes, hiredRes] = await Promise.all([
    supabase.from('referrals').select('id, jobs!inner(client_id)', { count: 'exact', head: true }).eq('jobs.client_id', user.id),
    supabase.from('referrals').select('id, jobs!inner(client_id)', { count: 'exact', head: true }).eq('jobs.client_id', user.id).in('status', ['submitted','reviewed','shortlisted']),
    supabase.from('referrals').select('id, jobs!inner(client_id)', { count: 'exact', head: true }).eq('jobs.client_id', user.id).in('status', ['interviewing']),
    supabase.from('referrals').select('id, jobs!inner(client_id)', { count: 'exact', head: true }).eq('jobs.client_id', user.id).eq('status', 'hired'),
  ]);

  // Pipeline
  const { data: pipeline } = await supabase
    .from('referrals')
    .select('id, status, created_at, candidate:candidates!inner(id, first_name, last_name, current_title, resume_url), job:jobs!inner(id, title, client_id)')
    .eq('jobs.client_id', user.id)
    .order('created_at', { ascending: false });

  const columns = ['submitted','reviewed','shortlisted','interviewing','hired','rejected'];

  return (
    <div className="px-4 py-6 md:px-6">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Candidates</h1>
        <div className="text-sm text-muted-foreground">Review candidates referred to your jobs.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{fmt(totalRes.count || 0)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Pending Review</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{fmt(pendingRes.count || 0)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Interviewing</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{fmt(interviewingRes.count || 0)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Hired</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{fmt(hiredRes.count || 0)}</div></CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {columns.map(col => (
          <Card key={col}>
            <CardHeader className="pb-2"><CardTitle className="text-sm capitalize">{col}</CardTitle></CardHeader>
            <CardContent>
              {(pipeline || []).filter((p: any) => p.status === col).slice(0, 8).map((p: any) => (
                <div key={p.id} className="mb-3 rounded border p-2 text-xs">
                  <div className="font-semibold">{p.candidate?.first_name} {p.candidate?.last_name} <span className="text-muted-foreground">{p.candidate?.current_title ? `· ${p.candidate.current_title}` : ''}</span></div>
                  <div className="text-muted-foreground">{p.job?.title}</div>
                  <div className="mt-2 flex gap-2">
                    <Link href={`/candidates/${p.candidate?.id}`} className="underline">View</Link>
                    <Link href={`/candidates/${p.candidate?.id}`} className="underline">Resume</Link>
                    <Link href={`/candidates/${p.candidate?.id}`} className="underline">Notes</Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


