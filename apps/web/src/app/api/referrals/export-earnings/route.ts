import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getSharePercentForRole(role: string | null): number {
  if (!role) return 0;
  const r = role.toLowerCase();
  if (r.includes("founding")) return 0.15;
  if (r.includes("select")) return 0.40;
  return 0;
}

function estimatePlacementFee(salaryMin?: number | null, salaryMax?: number | null): number {
  const min = Number(salaryMin ?? 0) || 0;
  const max = Number(salaryMax ?? 0) || min;
  const avg = max && min ? (min + max) / 2 : min || max || 0;
  return avg * 0.20; // 20%
}

type ExportReferralRow = {
  id: string;
  status: string | null;
  created_at: string | null;
  job: { id: string; title: string | null; salary_min: number | null; salary_max: number | null } | null;
};

export async function POST() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").match({ id: user.id as string }).single();
  const share = getSharePercentForRole((profile as any)?.role ?? null);

  const { data, error } = await supabase
    .from("referrals")
    .select("id, status, created_at, job:jobs(id, title, salary_min, salary_max)")
    .match({ referrer_id: user.id as string })
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows: (string | number)[][] = [
    ["date", "job_title", "status", "placement_fee", "your_share"],
    ...(((data as unknown as any[]) ?? []).filter(r => r?.status === 'hired').map(r => {
      const job = Array.isArray(r?.job) ? r.job[0] : r?.job;
      const fee = estimatePlacementFee(job?.salary_min, job?.salary_max);
      const earn = fee * share;
      return [
        r.created_at ? new Date(r.created_at).toISOString().slice(0,10) : '',
        job?.title || '',
        r.status || '',
        Math.round(fee),
        Math.round(earn),
      ];
    }))
  ];

  const csv = rows.map(cols => cols.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="referral-earnings.csv"',
    },
  });
}


