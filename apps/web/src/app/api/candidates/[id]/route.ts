import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await getSupabaseServerClient();
    const candidateId = params.id;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = profile?.role ?? null;

    const { data: candidate, error: candErr } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", candidateId)
      .single();
    if (candErr || !candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

    // Latest referral for this candidate (by candidate email)
    const { data: referral } = await supabase
      .from("referrals")
      .select("*, job:jobs(*), referrer:profiles!referrer_id(first_name,last_name)")
      .eq("candidate_email", candidate.email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Client access control: only see candidates for their jobs
    if (role === "client" && referral?.job?.client_id && referral.job.client_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Try to generate a signed URL for the resume if stored
    let resumeSignedUrl: string | null = null;
    try {
      const path = candidate.resume_url as string | null;
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


