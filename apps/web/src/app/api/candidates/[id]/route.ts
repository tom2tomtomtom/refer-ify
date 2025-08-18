import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServerClient();
    const { id: candidateId } = await context.params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").match({ id: user.id as string }).single();
    const role = (profile as any)?.role ?? null;

    const { data: candidate, error: candErr } = await supabase
      .from("candidates")
      .select("*")
      .match({ id: candidateId as string })
      .single();
    if (candErr || !candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

    // Latest referral for this candidate (by candidate email)
    const candRow: any = candidate as any;
    const candEmail = candRow?.email as string;
    const { data: referral } = await supabase
      .from("referrals")
      .select("*, job:jobs(*), referrer:profiles!referrer_id(first_name,last_name)")
      .match({ candidate_email: candEmail })
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Client access control: only see candidates for their jobs
    const refRow: any = referral as any;
    if (role === "client" && refRow?.job?.client_id && refRow.job.client_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Try to generate a signed URL for the resume if stored
    let resumeSignedUrl: string | null = null;
    try {
      const path = (candRow?.resume_url as string) || null;
      if (path) {
        const { data } = await supabase.storage.from("resumes").createSignedUrl(path, 60 * 15);
        resumeSignedUrl = data?.signedUrl ?? null;
      }
    } catch {}

    return NextResponse.json({ candidate, referral, resumeSignedUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}


