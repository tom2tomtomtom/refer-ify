import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ClientJobOpportunitiesPage() {
  const supabase = await getSupabaseServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, description, requirements, subscription_tier, status')
    .order('created_at', { ascending: false })
    .limit(24);

  return (
    <div className="px-4 py-6 md:px-6">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Job Opportunities</h1>
        <div className="text-sm text-muted-foreground">Explore roles; invite referrals from your network.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(jobs || []).map((j: any) => (
          <Card key={j.id}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{j.title}</CardTitle></CardHeader>
            <CardContent>
              <div className="text-sm line-clamp-3">{j.description}</div>
              <div className="mt-3 flex gap-2 text-xs">
                <button className="rounded border px-3 py-1">Refer</button>
                <button className="rounded border px-3 py-1">Details</button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


