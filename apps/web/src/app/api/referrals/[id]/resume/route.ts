import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;

  const { data: referral, error } = await supabase
    .from("referrals")
    .select("resume_storage_path, job_id")
    .match({ id: id as string })
    .single();
  const refRow: any = referral as any;
  if (error || !refRow?.resume_storage_path) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // Ensure the requesting user is the job's client or the referrer
  const { data: job } = await supabase
    .from("jobs")
    .select("client_id")
    .match({ id: (refRow?.job_id as string) })
    .single();
  const allowed = (job as any)?.client_id === user.id;
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const service = getSupabaseServiceClient();
  const { data: signed, error: signErr } = await service.storage
    .from("resumes")
    .createSignedUrl(refRow.resume_storage_path as string, 60);
  if (signErr || !signed?.signedUrl) return NextResponse.json({ error: "Unable to sign URL" }, { status: 500 });
  return NextResponse.json({ url: signed.signedUrl });
}


