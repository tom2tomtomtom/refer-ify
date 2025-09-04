import { NextRequest, NextResponse } from "next/server";
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

// Consolidated endpoint handling multiple referral analytics operations
export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  const { data: profile } = await supabase.from("profiles").select("role").match({ id: user.id as string }).single();
  const share = getSharePercentForRole((profile as any)?.role ?? null);

  const { data, error } = await supabase
    .from("referrals")
    .select("id, status, created_at, job:jobs(id, title, salary_min, salary_max)")
    .match({ referrer_id: user.id as string })
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  switch (action) {
    case 'earnings-history': {
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

    case 'my-dashboard': {
      const allRefs = (data as unknown as any[]) ?? [];
      const total = allRefs.length;
      const active = allRefs.filter(r => ['pending', 'shortlisted', 'interviewing'].includes(r?.status || '')).length;
      const hired = allRefs.filter(r => r?.status === 'hired').length;
      const rejected = allRefs.filter(r => r?.status === 'rejected').length;
      
      let totalEarnings = 0;
      for (const row of allRefs) {
        if (row?.status === 'hired') {
          const job = Array.isArray(row?.job) ? row.job[0] : row?.job;
          const fee = estimatePlacementFee(job?.salary_min, job?.salary_max);
          totalEarnings += fee * share;
        }
      }

      return NextResponse.json({
        stats: { total, active, hired, rejected },
        totalEarnings: Math.round(totalEarnings),
        recentReferrals: allRefs.slice(-5).reverse()
      });
    }

    case 'analytics': {
      // General analytics aggregation
      const allRefs = (data as unknown as any[]) ?? [];
      const statusCounts: Record<string, number> = {};
      let totalPotentialEarnings = 0;
      let confirmedEarnings = 0;

      for (const row of allRefs) {
        const status = row?.status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
        
        const job = Array.isArray(row?.job) ? row.job[0] : row?.job;
        const fee = estimatePlacementFee(job?.salary_min, job?.salary_max);
        const earn = fee * share;
        
        if (status === 'hired') {
          confirmedEarnings += earn;
        }
        totalPotentialEarnings += earn;
      }

      return NextResponse.json({
        statusCounts,
        totalPotentialEarnings: Math.round(totalPotentialEarnings),
        confirmedEarnings: Math.round(confirmedEarnings),
        conversionRate: allRefs.length > 0 ? (statusCounts.hired || 0) / allRefs.length : 0
      });
    }

    default:
      return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
  }
}

// Handle earnings export
export async function POST(request: NextRequest) {
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