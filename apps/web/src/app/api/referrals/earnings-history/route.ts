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

type EarningsReferralRow = {
  id: string;
  status: string | null;
  created_at: string | null;
  job: { id: string; salary_min: number | null; salary_max: number | null } | null;
};

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").match({ id: user.id as string }).single();
  const share = getSharePercentForRole((profile as any)?.role ?? null);

  const { data, error } = await supabase
    .from("referrals")
    .select("id, status, created_at, job:jobs(id, salary_min, salary_max)")
    .match({ referrer_id: user.id as string })
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const monthMap = new Map<string, number>();
  for (const row of (data as unknown as any[]) ?? []) {
    const status: string = row?.status || '';
    if (status !== 'hired') continue;
    const job = Array.isArray(row?.job) ? row.job[0] : row?.job;
    const fee = estimatePlacementFee(job?.salary_min, job?.salary_max);
    const earn = fee * share;
    const createdAt = row?.created_at as string | undefined;
    const dt = new Date(createdAt ?? Date.now());
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(key, (monthMap.get(key) || 0) + earn);
  }

  const series = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([month, earnings]) => ({ month, earnings }));
  return NextResponse.json({ series });
}


