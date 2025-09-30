import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

function fmt(n: number) {
  try { return n.toLocaleString(); } catch { return String(n); }
}

export default async function ClientCandidatesPage() {
  const supabase = await getSupabaseServerComponentClient();
  const user = await getCurrentUser();
  if (!user) return null;

  // Check if demo mode
  const isDemo = user.id.startsWith('demo-') || user.id.startsWith('00000000-0000-0000-0000-');
  
  if (isDemo) {
    // Demo data for candidates page
    const demoData = {
      total: 15,
      pending: 8,
      interviewing: 4,
      hired: 3,
      pipeline: [
        { id: '1', status: 'submitted', candidate: { first_name: 'Sarah', last_name: 'Chen', current_title: 'VP Engineering' }, job: { title: 'CTO' } },
        { id: '2', status: 'reviewed', candidate: { first_name: 'Michael', last_name: 'Johnson', current_title: 'Senior Director' }, job: { title: 'VP Engineering' } },
        { id: '3', status: 'shortlisted', candidate: { first_name: 'Emily', last_name: 'Rodriguez', current_title: 'Lead Designer' }, job: { title: 'Head of Design' } },
        { id: '4', status: 'interviewing', candidate: { first_name: 'David', last_name: 'Kim', current_title: 'Product Manager' }, job: { title: 'Director of Product' } },
        { id: '5', status: 'hired', candidate: { first_name: 'Jessica', last_name: 'Taylor', current_title: 'Engineering Manager' }, job: { title: 'VP of Engineering' } },
      ]
    };
    
    const columns = ['submitted','reviewed','shortlisted','interviewing','hired','rejected'];
    
    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Candidates</h1>
          <div className="text-sm text-muted-foreground">Review candidates referred to your jobs.</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{demoData.total}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Pending Review</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{demoData.pending}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Interviewing</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{demoData.interviewing}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Hired</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{demoData.hired}</div></CardContent></Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {columns.map(col => (
            <Card key={col}>
              <CardHeader className="pb-2"><CardTitle className="text-sm capitalize">{col}</CardTitle></CardHeader>
              <CardContent>
                {demoData.pipeline.filter((p: any) => p.status === col).map((p: any) => (
                  <div key={p.id} className="mb-3 rounded border p-2 text-xs">
                    <div className="font-semibold">{p.candidate.first_name} {p.candidate.last_name} <span className="text-muted-foreground">· {p.candidate.current_title}</span></div>
                    <div className="text-muted-foreground">{p.job.title}</div>
                    <div className="mt-2 text-xs text-gray-500">Demo candidate data</div>
                  </div>
                ))}
                {demoData.pipeline.filter((p: any) => p.status === col).length === 0 && (
                  <div className="text-xs text-muted-foreground">No {col} candidates</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Real data for non-demo users
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


