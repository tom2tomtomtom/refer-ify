import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ClientJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("client");
  const { id } = await params;
  const supabase = await getSupabaseServerComponentClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (!job) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-sm text-muted-foreground mb-4">Job not found.</p>
        <Link href="/client/jobs" className="text-blue-600 hover:text-blue-800">← Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <Link href="/client/jobs" className="text-blue-600 hover:text-blue-800">← Back to Jobs</Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{job.title || "Untitled Job"}</span>
            <Badge variant="secondary">{job.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Created {job.created_at ? new Date(job.created_at).toLocaleDateString() : ""}
          </p>
          {job.description && (
            <div>
              <h3 className="text-sm font-medium mb-1">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{job.description}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Link href={`/client/jobs/${id}/referrals`}>
              <Button variant="default">Manage Referrals</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


