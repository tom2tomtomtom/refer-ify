import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== 'client') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const candidateId = params.id;
    const body = await req.json().catch(() => ({}));
    const notes: string = (body?.notes ?? '').toString();
    if (notes.length > 5000) return NextResponse.json({ error: 'Notes too long' }, { status: 400 });

    // Find latest referral for this candidate tied to this client
    const { data: referral } = await supabase
      .from('referrals')
      .select('id, candidate_email, job:jobs!inner(client_id)')
      .eq('candidate_email', (await supabase.from('candidates').select('email').eq('id', candidateId).single()).data?.email || '')
      .eq('job.client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (!referral) return NextResponse.json({ error: 'No access to this candidate' }, { status: 403 });

    // Update candidate_referrals client_notes (if column exists); fallback to referrals.referrer_notes
    let updated: any = null;
    try {
      const { data, error } = await supabase
        .from('candidate_referrals')
        .update({ client_notes: notes })
        .eq('candidate_id', candidateId)
        .eq('referral_id', referral.id)
        .select()
        .single();
      if (error) throw error;
      updated = data;
    } catch {
      // fallback: store in referrals.client_notes if schema differs
      const { data } = await supabase
        .from('referrals')
        .update({ client_notes: notes })
        .eq('id', referral.id)
        .select()
        .single();
      updated = data;
    }

    return NextResponse.json({ ok: true, updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}


