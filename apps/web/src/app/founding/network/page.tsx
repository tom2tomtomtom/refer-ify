import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type Member = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  created_at: string;
  role: string;
};

type Referral = {
  id: string;
  referrer_id: string | null;
  job_id: string | null;
  status: string | null;
  created_at: string;
};

export default async function NetworkGrowthPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Demo data for demo users
  const isDemo = user.id.startsWith('demo-') || user.id.startsWith('00000000-0000-0000-0000-');
  if (isDemo) {
    const demoMembers = [
      { id: '1', name: 'Sarah Chen', company: 'Tech Unicorn Inc', joined: '2024-09-15', referrals30: 8, jobsEngaged30: 4, successRate: 75 },
      { id: '2', name: 'Michael Rodriguez', company: 'StartupX', joined: '2024-10-01', referrals30: 6, jobsEngaged30: 3, successRate: 67 },
      { id: '3', name: 'Emily Watson', company: 'FinTech Corp', joined: '2024-10-15', referrals30: 5, jobsEngaged30: 3, successRate: 60 },
      { id: '4', name: 'David Kim', company: 'Brand Leaders LLC', joined: '2024-11-01', referrals30: 4, jobsEngaged30: 2, successRate: 50 },
      { id: '5', name: 'Jennifer Lee', company: 'Operations Pro Inc', joined: '2024-11-10', referrals30: 3, jobsEngaged30: 2, successRate: 67 },
    ];

    return (
      <div className="px-4 py-6 md:px-6">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Network Growth &amp; Management</h1>
          <div className="text-xs text-muted-foreground"><Link href="/founding">Back to Overview</Link></div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Network Members</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">28</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active This Month</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">18</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Successful Placements (90d)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-amber-600">12</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Growth Rate</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">+15%</div></CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Member Activity (last 30 days)</CardTitle>
              <div className="text-xs"><Link href="/founding/invite" className="underline">Invite New Member</Link></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Member</th>
                    <th className="py-2 pr-4">Company</th>
                    <th className="py-2 pr-4">Joined</th>
                    <th className="py-2 pr-4">Referrals</th>
                    <th className="py-2 pr-4">Jobs Engaged</th>
                    <th className="py-2 pr-4">Success Rate (90d)</th>
                  </tr>
                </thead>
                <tbody>
                  {demoMembers.map(r => (
                    <tr key={r.id} className="border-b last:border-none">
                      <td className="py-2 pr-4 font-medium">{r.name}</td>
                      <td className="py-2 pr-4">{r.company}</td>
                      <td className="py-2 pr-4">{r.joined}</td>
                      <td className="py-2 pr-4">{r.referrals30}</td>
                      <td className="py-2 pr-4">{r.jobsEngaged30}</td>
                      <td className="py-2 pr-4">{r.successRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
              💡 Demo data shown for walkthrough purposes
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const supabase = await getSupabaseServerComponentClient();

  const now = Date.now();
  const last30ISO = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  const last90ISO = new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString();
  const prev30StartISO = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString();

  let members: Member[] = [];
  let referralsLast30: Referral[] = [];
  let referralsLast90: Referral[] = [];
  let successfulReferrals90: Referral[] = [];

  try {
    const { data: networkMembers } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, company, created_at, role")
      .in("role", ["founding_circle", "select_circle"])
      .order("created_at", { ascending: false });
    members = (networkMembers as Member[]) ?? [];
  } catch {}

  try {
    const { data } = await supabase
      .from("referrals")
      .select("id, referrer_id, job_id, status, created_at")
      .gte("created_at", last30ISO);
    referralsLast30 = (data as Referral[]) ?? [];
  } catch {}

  try {
    const { data } = await supabase
      .from("referrals")
      .select("id, referrer_id, job_id, status, created_at")
      .gte("created_at", last90ISO);
    referralsLast90 = (data as Referral[]) ?? [];
  } catch {}

  try {
    const { data } = await supabase
      .from("referrals")
      .select("id, referrer_id, job_id, status, created_at")
      .eq("status", "hired")
      .gte("created_at", last90ISO);
    successfulReferrals90 = (data as Referral[]) ?? [];
  } catch {}

  // Metrics
  const totalMembers = members.length;
  const activeMembersThisMonth = new Set(
    referralsLast30.map(r => r.referrer_id).filter(Boolean)
  ).size;
  const successfulPlacements = successfulReferrals90.length;
  const last30Joins = members.filter(m => m.created_at >= last30ISO).length;
  const prev30Joins = members.filter(m => m.created_at >= prev30StartISO && m.created_at < last30ISO).length;
  const growthRate = prev30Joins > 0 ? Math.round(((last30Joins - prev30Joins) / prev30Joins) * 100) : null;

  // Per-member stats
  const memberById = new Map(members.map(m => [m.id, m]));
  const last30ByMember = new Map<string, Referral[]>();
  referralsLast30.forEach(r => {
    if (!r.referrer_id) return;
    const arr = last30ByMember.get(r.referrer_id) ?? [];
    arr.push(r);
    last30ByMember.set(r.referrer_id, arr);
  });
  const last90ByMember = new Map<string, Referral[]>();
  referralsLast90.forEach(r => {
    if (!r.referrer_id) return;
    const arr = last90ByMember.get(r.referrer_id) ?? [];
    arr.push(r);
    last90ByMember.set(r.referrer_id, arr);
  });
  const success90ByMember = new Map<string, number>();
  successfulReferrals90.forEach(r => {
    if (!r.referrer_id) return;
    success90ByMember.set(r.referrer_id, (success90ByMember.get(r.referrer_id) ?? 0) + 1);
  });

  const rows = Array.from(memberById.keys()).map(memberId => {
    const m = memberById.get(memberId)!;
    const r30 = last30ByMember.get(memberId) ?? [];
    const r90 = last90ByMember.get(memberId) ?? [];
    const s90 = success90ByMember.get(memberId) ?? 0;
    const jobsEngaged = new Set(r30.map(r => r.job_id).filter(Boolean)).size;
    const successRate = r90.length > 0 ? Math.round((s90 / r90.length) * 100) : 0;
    return {
      id: memberId,
      name: [m.first_name, m.last_name].filter(Boolean).join(" ") || "Member",
      company: m.company || "—",
      joined: new Date(m.created_at).toLocaleDateString(),
      referrals30: r30.length,
      jobsEngaged30: jobsEngaged,
      successRate,
    };
  });

  const topRows = rows
    .sort((a, b) => b.referrals30 - a.referrals30)
    .slice(0, 10);

  return (
    <div className="px-4 py-6 md:px-6">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Network Growth &amp; Management</h1>
        <div className="text-xs text-muted-foreground"><Link href="/founding">Back to Overview</Link></div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Network Members</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalMembers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active This Month</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{activeMembersThisMonth}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Successful Placements (90d)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{successfulPlacements}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Growth Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{growthRate === null ? '—' : `${growthRate}%`}</div></CardContent>
        </Card>
      </div>

      {/* Member Activity Table */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Member Activity (last 30 days)</CardTitle>
            <div className="text-xs"><Link href="/founding/invite" className="underline">Invite New Member</Link></div>
          </div>
        </CardHeader>
        <CardContent>
          {topRows.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent activity.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Member</th>
                    <th className="py-2 pr-4">Company</th>
                    <th className="py-2 pr-4">Joined</th>
                    <th className="py-2 pr-4">Referrals</th>
                    <th className="py-2 pr-4">Jobs Engaged</th>
                    <th className="py-2 pr-4">Success Rate (90d)</th>
                  </tr>
                </thead>
                <tbody>
                  {topRows.map(r => (
                    <tr key={r.id} className="border-b last:border-none">
                      <td className="py-2 pr-4 font-medium">{r.name}</td>
                      <td className="py-2 pr-4">{r.company}</td>
                      <td className="py-2 pr-4">{r.joined}</td>
                      <td className="py-2 pr-4">{r.referrals30}</td>
                      <td className="py-2 pr-4">{r.jobsEngaged30}</td>
                      <td className="py-2 pr-4">{r.successRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


