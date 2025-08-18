import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ReferralStatus = "submitted" | "reviewed" | "shortlisted" | "interviewing" | "hired" | "rejected";

type DashboardReferralRow = {
  id: string;
  status: ReferralStatus | null;
  created_at: string | null;
  job: { id: string; title: string | null; client_id: string | null; salary_min: number | null; salary_max: number | null } | null;
  candidate_ref: { id: string; candidate: { id: string; first_name: string | null; last_name: string | null; current_title: string | null } | null } | null;
};

function getSharePercentForRole(role: string | null): number {
  // Standard placement fee = 20% of comp. Share is a percent of that fee.
  if (!role) return 0;
  const normalized = role.toLowerCase();
  if (normalized.includes("founding")) return 0.15; // 15% of placement fee
  if (normalized.includes("select")) return 0.40;   // 40% of placement fee
  return 0; // clients/candidates have no referral share
}

function estimatePlacementFee(salaryMin?: number | null, salaryMax?: number | null): number {
  const min = Number(salaryMin ?? 0) || 0;
  const max = Number(salaryMax ?? 0) || min;
  const avg = max && min ? (min + max) / 2 : min || max || 0;
  return avg * 0.20; // 20% standard placement fee
}

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Determine user role to compute earnings share
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .match({ id: user.id as string })
    .single();

  const sharePercent = getSharePercentForRole((profile as any)?.role ?? null);

  // Fetch referrals for this user with job + candidate data
  const { data: referrals, error: referralsError } = await supabase
    .from("referrals")
    .select("id, status, created_at, job:jobs(id, title, client_id, salary_min, salary_max), candidate_ref:candidate_referrals(id, candidate:candidates(id, first_name, last_name, current_title)))")
    .match({ referrer_id: user.id as string })
    .order("created_at", { ascending: false });
  if (referralsError) return NextResponse.json({ error: referralsError.message }, { status: 500 });

  // Compute earnings metrics
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  let totalEarnings = 0;
  let thisMonthEarnings = 0;
  let hiredCount = 0;
  const pipelineCounts: Record<string, number> = {
    submitted: 0,
    reviewed: 0,
    shortlisted: 0,
    interviewing: 0,
    hired: 0,
    rejected: 0,
  };

  const earningsSeriesMap = new Map<string, number>();

  const pipeline = ((referrals as unknown as any[]) ?? []).map((r) => {
    const job = Array.isArray(r?.job) ? r.job[0] : r?.job;
    const candidateRef = Array.isArray(r?.candidate_ref) ? r.candidate_ref[0] : r?.candidate_ref;
    const candidate = candidateRef?.candidate || null;
    const status: ReferralStatus = (r?.status as ReferralStatus) || "submitted";

    // Derive interviewing from interactions table (optional best-effort)
    // For simplicity here, if status is reviewed/shortlisted and created_at > 14 days, treat as interviewing
    let pipelineStage: keyof typeof pipelineCounts = status as any;
    if ((status === "reviewed" || status === "shortlisted") && r.created_at) {
      const days = Math.max(0, Math.floor((Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24)));
      if (days > 14) pipelineStage = "interviewing";
    }
    pipelineCounts[pipelineStage] = (pipelineCounts[pipelineStage] || 0) + 1;

    // Potential earnings
    const placementFee = estimatePlacementFee(job?.salary_min, job?.salary_max);
    const potential = placementFee * sharePercent;

    // Completed earnings (hired)
    if (status === "hired") {
      totalEarnings += potential;
      hiredCount += 1;
      const dt = new Date(r.created_at ?? Date.now());
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      earningsSeriesMap.set(key, (earningsSeriesMap.get(key) || 0) + potential);
      if (key === currentMonthKey) thisMonthEarnings += potential;
    }

    // Days in current status (approx from created_at)
    const daysInStatus = r?.created_at ? Math.max(0, Math.floor((Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24))) : 0;

    return {
      id: r.id,
      candidateId: candidate?.id || '',
      candidateName: [candidate?.first_name, candidate?.last_name].filter(Boolean).join(" ") || "Candidate",
      candidateTitle: candidate?.current_title || "",
      jobTitle: job?.title || "",
      clientCompany: job?.client_id || "",
      status: pipelineStage,
      statusHistory: [
        { status: "submitted", date: r?.created_at },
        { status, date: r?.created_at },
      ],
      potentialEarnings: potential,
      daysInStatus,
    };
  });

  const totalReferrals = referrals?.length ?? 0;
  const successRate = totalReferrals ? Math.round((hiredCount / totalReferrals) * 100) : 0;

  // Pipeline value = sum of potential for active (not rejected/hired)
  const pipelineValue = pipeline
    .filter((p) => p.status !== "hired" && p.status !== "rejected")
    .reduce((t, p) => t + (p.potentialEarnings || 0), 0);

  // Earnings series (last 6-12 months)
  const seriesKeys = Array.from(earningsSeriesMap.keys()).sort();
  const earningsSeries = seriesKeys.map((k) => ({ month: k, earnings: Number(earningsSeriesMap.get(k) || 0) }));

  // Performance comparison (simple placeholder vs network avg = 70% of your earnings)
  const performanceComparison = {
    you: totalEarnings,
    networkAverage: totalEarnings * 0.7,
  };

  // Achievements (simple examples)
  const achievements = [
    ...(hiredCount > 0 ? [{ key: "first_hire", label: "First Hire", achievedAt: new Date().toISOString() }] : []),
    ...(totalReferrals >= 5 ? [{ key: "five_referrals", label: "5 Referrals", achievedAt: new Date().toISOString() }] : []),
  ];

  const p: any = profile as any;
  const profileRole = p?.role ?? null;
  const profileName = [p?.first_name, p?.last_name].filter(Boolean).join(" ");

  return NextResponse.json({
    profile: { id: user.id, role: profileRole, name: profileName },
    metrics: {
      totalEarnings,
      pipelineValue,
      successRate, // percent
      thisMonthEarnings,
    },
    charts: {
      earningsSeries,
      pipelineCounts,
      performanceComparison,
    },
    pipeline,
    achievements,
    goals: [
      { period: "monthly", target: Math.max(5000, Math.round(totalEarnings / 3)), progress: thisMonthEarnings },
      { period: "quarterly", target: Math.max(15000, Math.round(totalEarnings)), progress: totalEarnings },
    ],
  });
}


