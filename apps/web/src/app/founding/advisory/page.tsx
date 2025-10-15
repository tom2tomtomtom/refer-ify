import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvisorySessionsClient } from "@/components/founding/AdvisorySessionsClient";
import Link from "next/link";

function fmt(n: number) { try { return n.toLocaleString(); } catch { return String(n); } }

export default async function AdvisoryPage() {
  const supabase = await getSupabaseServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Demo data for demo users
  const isDemo = user?.id.startsWith('demo-');
  if (isDemo) {
    const demoSessions = [
      { id: '1', session_date: '2024-12-15', duration_hours: 2, rate_per_hour: 500, status: 'completed', client_name: 'TechCorp', notes: 'Product strategy session' },
      { id: '2', session_date: '2024-12-08', duration_hours: 1.5, rate_per_hour: 500, status: 'completed', client_name: 'StartupXYZ', notes: 'Leadership coaching' },
      { id: '3', session_date: '2024-12-20', duration_hours: 2, rate_per_hour: 500, status: 'scheduled', client_name: 'FinTech Inc', notes: 'Tech roadmap review' },
      { id: '4', session_date: '2024-12-22', duration_hours: 3, rate_per_hour: 500, status: 'scheduled', client_name: 'GrowthCo', notes: 'Organizational design' },
    ];

    const availableHours = 5;
    const completedCount = 2;
    const monthlyRevenue = 1750;
    const avgSession = 875;

    return (
      <div className="px-4 py-6 md:px-6">
        <div className="text-xs text-muted-foreground mb-2">Dashboard &gt; Founder &gt; Advisory Services</div>
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Advisory Services ($500/hour)</h1>
          <div className="text-xs text-muted-foreground flex items-center gap-3">
            <Link href="/founding">Back to Overview</Link>
            <span className="opacity-40">|</span>
            <Link href="/founding/revenue" className="underline">View Network ROI</Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Available Hours This Month</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{fmt(availableHours)}</div></CardContent></Card>
          <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Completed Sessions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{fmt(completedCount)}</div></CardContent></Card>
          <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Monthly Advisory Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${fmt(monthlyRevenue)}</div></CardContent></Card>
          <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Average Session Value</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${fmt(avgSession)}</div></CardContent></Card>
        </div>

        <AdvisorySessionsClient founderId={user.id} initialSessions={demoSessions as any[]} />

        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
          💡 Demo data shown for walkthrough purposes
        </div>
      </div>
    );
  }

  let sessions: any[] = [];
  if (user) {
    const { data } = await supabase
      .from('advisory_sessions')
      .select('*')
      .eq('founder_id', user.id)
      .order('session_date', { ascending: true });
    sessions = data ?? [];
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  const inThisMonth = sessions.filter(s => new Date(s.session_date) >= monthStart);
  const completed = sessions.filter(s => s.status === 'completed');
  const scheduled = sessions.filter(s => s.status === 'scheduled');
  const monthlyRevenue = completed
    .filter(s => new Date(s.session_date) >= monthStart)
    .reduce((t, s) => t + (Number(s.duration_hours)||0) * (Number(s.rate_per_hour)||500), 0);
  const avgSession = completed.length ? monthlyRevenue / completed.length : 0;
  const availableHours = scheduled.reduce((t,s)=> t + (Number(s.duration_hours)||0), 0);

  return (
    <div className="px-4 py-6 md:px-6">
      <div className="text-xs text-muted-foreground mb-2">Dashboard &gt; Founding Circle &gt; Advisory Services</div>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Advisory Services ($500/hour)</h1>
        <div className="text-xs text-muted-foreground flex items-center gap-3">
          <Link href="/founding">Back to Overview</Link>
          <span className="opacity-40">|</span>
          <Link href="/founding/revenue" className="underline">View Network ROI</Link>
        </div>
      </div>

      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Available Hours This Month</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{fmt(availableHours)}</div></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Completed Sessions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{fmt(completed.length)}</div></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Monthly Advisory Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${fmt(monthlyRevenue)}</div></CardContent></Card>
        <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Average Session Value</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${fmt(avgSession)}</div></CardContent></Card>
      </div>

      {/* Management Dashboard */}
      {user ? (
        <AdvisorySessionsClient founderId={user.id} initialSessions={sessions as any[]} />
      ) : (
        <Card><CardContent><div className="text-sm text-muted-foreground">Sign in to manage advisory sessions.</div></CardContent></Card>
      )}
    </div>
  );
}


