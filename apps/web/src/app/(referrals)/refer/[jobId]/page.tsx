import { requireRole } from "@/lib/auth";
import { getSupabaseServerComponentClient } from "@/lib/supabase/server";
import { ReferralForm } from "@/components/referrals/ReferralForm";

export const dynamic = "force-dynamic";

export default async function ReferCandidatePage({ params }: { params: Promise<{ jobId: string }> }) {
  await requireRole(["select_circle", "founding_circle"]);
  const { jobId } = await params;
  const supabase = await getSupabaseServerComponentClient();
  const { data: job } = await supabase.from("jobs").select("*").eq("id", jobId).single();

  return <ReferralForm job={job} />;
}


