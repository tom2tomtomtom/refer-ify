import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteForm } from "@/components/founding/InviteForm";
import Link from "next/link";

export default async function InviteMembersPage() {
  const supabase = await getSupabaseServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

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


