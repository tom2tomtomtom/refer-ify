import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteForm } from "@/components/founding/InviteForm";
import Link from "next/link";

export default async function InviteMembersPage() {
  const supabase = await getSupabaseServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Demo data for demo users
  const isDemo = user?.id.startsWith('demo-') || user?.id.startsWith('00000000-0000-0000-0000-');
  if (isDemo) {
    const demoInvitations = [
      { id: '1', invited_name: 'Jennifer Martinez', invited_company: 'TechCorp', invited_email: 'jennifer@techcorp.com', status: 'joined', sent_at: '2024-11-15T10:00:00Z' },
      { id: '2', invited_name: 'Robert Singh', invited_company: 'StartupXYZ', invited_email: 'robert@startupxyz.com', status: 'accepted', sent_at: '2024-11-20T14:30:00Z' },
      { id: '3', invited_name: 'Anna Liu', invited_company: 'DesignCo', invited_email: 'anna@designco.com', status: 'opened', sent_at: '2024-12-01T09:15:00Z' },
      { id: '4', invited_name: 'Michael Brown', invited_company: 'FinTech Inc', invited_email: 'michael@fintech.com', status: 'sent', sent_at: '2024-12-10T16:45:00Z' },
    ];

    const totalSent = 4;
    const accepted = 2;
    const pending = 2;
    const successRate = 50;

    return (
      <div className="px-4 py-6 md:px-6">
        <div className="text-xs text-muted-foreground mb-2">Dashboard &gt; Founding Circle &gt; Invite Members</div>
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Invite Select Circle Members</h1>
          <div className="text-xs text-muted-foreground flex items-center gap-3">
            <Link href="/founding">Back to Overview</Link>
            <span className="opacity-40">|</span>
            <Link href="/founding/network" className="underline">Check Network Growth</Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Send Invitation</CardTitle></CardHeader>
            <CardContent>
              <InviteForm founderId={user.id} />
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Total Sent</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalSent}</div></CardContent></Card>
              <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Accepted</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{accepted}</div></CardContent></Card>
              <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{pending}</div></CardContent></Card>
              <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Success Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{successRate}%</div></CardContent></Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Invitation Status</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Company</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demoInvitations.map(inv => (
                        <tr key={inv.id} className="border-b last:border-none">
                          <td className="py-2 pr-4">{inv.invited_name}</td>
                          <td className="py-2 pr-4">{inv.invited_company}</td>
                          <td className="py-2 pr-4">{inv.invited_email}</td>
                          <td className="py-2 pr-4 capitalize">{inv.status}</td>
                          <td className="py-2 pr-4">{new Date(inv.sent_at).toLocaleString()}</td>
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
        </div>
      </div>
    );
  }

  let invitations: any[] = [];
  try {
    if (user) {
      const { data } = await supabase
        .from('select_circle_invitations')
        .select('*')
        .eq('founder_id', user.id)
        .order('sent_at', { ascending: false });
      invitations = data ?? [];
    }
  } catch {}

  const totalSent = invitations.length;
  const accepted = invitations.filter(i => i.status === 'accepted' || i.status === 'joined').length;
  const pending = invitations.filter(i => i.status === 'sent' || i.status === 'opened').length;
  const successRate = totalSent ? Math.round((accepted / totalSent) * 100) : 0;

  return (
    <div className="px-4 py-6 md:px-6">
      <div className="text-xs text-muted-foreground mb-2">Dashboard &gt; Founding Circle &gt; Invite Members</div>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invite Select Circle Members</h1>
        <div className="text-xs text-muted-foreground flex items-center gap-3">
          <Link href="/founding">Back to Overview</Link>
          <span className="opacity-40">|</span>
          <Link href="/founding/network" className="underline">Check Network Growth</Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Form */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Send Invitation</CardTitle></CardHeader>
          <CardContent>
            {user ? <InviteForm founderId={user.id} /> : <div className="text-sm text-muted-foreground">Sign in to send invitations.</div>}
          </CardContent>
        </Card>

        {/* Right: Dashboard */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Total Sent</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalSent}</div></CardContent></Card>
            <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Accepted</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{accepted}</div></CardContent></Card>
            <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{pending}</div></CardContent></Card>
            <Card><CardHeader className="pb-1"><CardTitle className="text-sm">Success Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{successRate}%</div></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Invitation Status</CardTitle></CardHeader>
            <CardContent>
              {invitations.length === 0 ? (
                <div className="text-sm text-muted-foreground">No invitations yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Company</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitations.map(inv => (
                        <tr key={inv.id} className="border-b last:border-none">
                          <td className="py-2 pr-4">{inv.invited_name || '—'}</td>
                          <td className="py-2 pr-4">{inv.invited_company || '—'}</td>
                          <td className="py-2 pr-4">{inv.invited_email}</td>
                          <td className="py-2 pr-4 capitalize">{inv.status}</td>
                          <td className="py-2 pr-4">{inv.sent_at ? new Date(inv.sent_at).toLocaleString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


