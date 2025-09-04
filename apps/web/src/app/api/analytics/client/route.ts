import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get job IDs for this client first
  const jobsRes = await supabase.from('jobs').select('id').match({ client_id: user.id as string });
  const jobIds: string[] = (jobsRes.data as any[])?.map((j: any) => j.id) || [];

  // Short-circuit if no jobs
  if (!jobIds.length) {
    return NextResponse.json({ pipelineCounts: {}, conversionRates: { submitted_to_reviewed: 0, reviewed_to_shortlisted: 0, shortlisted_to_hired: 0 }, avgTimeToHire: 0 });
  }

  // Fetch all referrals for these jobs
  const { data: referrals, error } = await supabase
    .from('referrals')
    .select(`
      id, status, created_at,
      job:jobs(id, title, created_at)
    `)
    .in('job_id', jobIds);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pipelineCounts: Record<string, number> = {};
  let submitted = 0, reviewed = 0, shortlisted = 0, hired = 0;
  let totalToHireDays = 0, hires = 0;

  for (const r of (referrals as any[]) || []) {
    const s = r?.status || 'submitted';
    pipelineCounts[s] = (pipelineCounts[s] || 0) + 1;
    if (s === 'submitted') submitted++; if (s === 'reviewed') reviewed++; if (s === 'shortlisted') shortlisted++; if (s === 'hired') hired++;
    if (s === 'hired' && r?.created_at) {
      const days = Math.max(0, Math.floor((Date.now() - new Date(r.created_at).getTime()) / (1000*60*60*24)));
      totalToHireDays += days; hires += 1;
    }
  }

  const conversionRates = {
    submitted_to_reviewed: reviewed / Math.max(1, submitted),
    reviewed_to_shortlisted: shortlisted / Math.max(1, reviewed),
    shortlisted_to_hired: hired / Math.max(1, shortlisted),
  };
  const avgTimeToHire = hires ? Math.round(totalToHireDays / hires) : 0;

  return NextResponse.json({ pipelineCounts, conversionRates, avgTimeToHire });
}

