import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DollarSign, TrendingUp, Users, Clock, PlusCircle, Activity, ArrowRightCircle } from "lucide-react";

export default async function FoundingDashboardPage() {
  let displayName = "Member";
  let totalNetworkRevenue = 47250;
  let yourMonthlyEarnings = 7088;
  let invitedActive = 23;
  let advisoryHours = 8.5;
  try {
    const supabase = await getSupabaseServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name,last_name")
        .eq("id", user.id)
        .single();
      const n = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
      if (n) displayName = n;

      // Pull latest metrics if tables exist (best-effort; falls back to defaults)
      try {
        const { data: fm } = await (supabase as any)
          .from('founding_metrics')
          .select('*')
          .eq('user_id', user.id)
          .order('month', { ascending: false })
          .limit(1)
          .maybeSingle?.() ?? await (supabase as any)
            .from('founding_metrics')
            .select('*')
            .eq('user_id', user.id)
            .order('month', { ascending: false })
            .limit(1)
            .single();
        if (fm) {
          if (typeof fm.network_revenue === 'number') totalNetworkRevenue = fm.network_revenue;
          const direct = typeof fm.direct_referrals === 'number' ? fm.direct_referrals : 0;
          const advisory = typeof fm.advisory_revenue === 'number' ? fm.advisory_revenue : 0;
          // 15% share is fm.network_revenue*0.15 if not stored separately
          const networkShare = typeof fm.network_revenue === 'number' ? Math.round(fm.network_revenue * 0.15) : 0;
          yourMonthlyEarnings = networkShare + direct + advisory;
        }
      } catch {}
      try {
        const { count } = await (supabase as any)
          .from('select_circle_invitations')
          .select('id', { count: 'exact', head: true })
          .eq('founder_id', user.id)
          .in?.('status', ['accepted','joined']) ?? { count: undefined };
        if (typeof count === 'number') invitedActive = count;
      } catch {}
      try {
        const { data: sessions } = await (supabase as any)
          .from('advisory_sessions')
          .select('duration_hours')
          .eq('founder_id', user.id)
          .eq('status','scheduled');
        if (Array.isArray(sessions)) {
          advisoryHours = sessions.reduce((s: number, r: any) => s + (Number(r?.duration_hours) || 0), 0);
        }
      } catch {}
    }
  } catch {}

  return (
    <div className="px-4 py-6 md:px-6">
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground mb-2">Dashboard &gt; Founder</div>

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            Welcome back, {displayName}
            <Badge variant="secondary">Founder</Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Your network drives premium outcomes across the platform.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/founding/invite"><Button variant="default" className="gap-2"><PlusCircle className="h-4 w-4"/> Invite New Member</Button></Link>
          <Link href="/founding/advisory"><Button variant="outline" className="gap-2"><Activity className="h-4 w-4"/> Manage Advisory</Button></Link>
          <Link href="/founding/network"><Button variant="outline" className="gap-2"><Users className="h-4 w-4"/> Network Growth</Button></Link>
          <Link href="/founding/revenue"><Button variant="outline" className="gap-2"><ArrowRightCircle className="h-4 w-4"/> Revenue Details</Button></Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <Link href="/founding/revenue">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Network Revenue</CardTitle></CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">${totalNetworkRevenue.toLocaleString()}/mo</div>
              <div className="text-xs text-green-600">+12% growth</div>
            </div>
            <TrendingUp className="h-5 w-5 text-green-600"/>
          </CardContent>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <Link href="/founding/revenue">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Your Monthly Earnings (15%)</CardTitle></CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-2xl font-bold">${yourMonthlyEarnings.toLocaleString()}</div>
            <DollarSign className="h-5 w-5 text-blue-600"/>
          </CardContent>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <Link href="/founding/network">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Members You Invited (Active)</CardTitle></CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-2xl font-bold">{invitedActive}</div>
            <Users className="h-5 w-5 text-amber-600"/>
          </CardContent>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <Link href="/founding/advisory">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Advisory Hours Available</CardTitle></CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-2xl font-bold">{advisoryHours} hrs</div>
            <Clock className="h-5 w-5 text-purple-600"/>
          </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">Sarah Chen (Meta) joined through your invitation</div>
                <div className="text-xs text-muted-foreground">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">Placement completed: $8,000 network bonus earned</div>
                <div className="text-xs text-muted-foreground">Yesterday</div>
              </div>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">Advisory session scheduled with TechCorp</div>
                <div className="text-xs text-muted-foreground">3 days ago</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


