import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ReferralRow = {
  id: string;
  status: string | null;
  created_at: string | null;
  job: { id: string; title: string | null; requirements: Record<string, unknown> | null } | null;
};

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("referrals")
    .select("id, status, created_at, job:jobs(id, title, requirements)")
    .match({ referrer_id: user.id as string });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const byStatus: Record<string, number> = {};
  const byIndustry: Record<string, number> = {};
  let totalToHireDays = 0;
  let hires = 0;

  for (const row of (data as unknown as any[]) ?? []) {
    const status: string = row?.status || 'submitted';
    byStatus[status] = (byStatus[status] || 0) + 1;

    const job = Array.isArray(row?.job) ? row.job[0] : row?.job;
    const requirements = (job?.requirements as Record<string, unknown> | null) || null;
    const industry = (requirements?.['industry'] as string) || 'general';
    byIndustry[industry] = (byIndustry[industry] || 0) + (status === 'hired' ? 1 : 0);

    const createdAt = row?.created_at as string | undefined;
    if (status === 'hired' && createdAt) {
      const days = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)));
      totalToHireDays += days;
      hires += 1;
    }
  }

  const avgTimeToHire = hires ? Math.round(totalToHireDays / hires) : 0;
  const conversionRates = {
    submitted_to_reviewed: (byStatus['reviewed'] || 0) / Math.max(1, byStatus['submitted'] || 0),
    reviewed_to_shortlisted: (byStatus['shortlisted'] || 0) / Math.max(1, byStatus['reviewed'] || 0),
    shortlisted_to_hired: (byStatus['hired'] || 0) / Math.max(1, byStatus['shortlisted'] || 0),
  };

  return NextResponse.json({ byStatus, byIndustry, avgTimeToHire, conversionRates });
}


