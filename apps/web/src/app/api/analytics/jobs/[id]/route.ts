import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  // Ensure this job belongs to the current client
  const jobRes = await supabase.from('jobs').select('id, client_id, created_at').eq('id', id).single();
  if (jobRes.error) return NextResponse.json({ error: jobRes.error.message }, { status: 404 });
  if (!jobRes.data || jobRes.data.client_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Pull referrals for this job
  const { data: referrals, error } = await supabase
    .from('referrals')
    .select('id, status, created_at')
    .eq('job_id', id);
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

  return NextResponse.json({ pipelineCounts, conversionRates, avgTimeToHire, jobCreatedAt: jobRes.data.created_at });
}

