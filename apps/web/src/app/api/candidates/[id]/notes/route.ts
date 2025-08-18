import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").match({ id: user.id as string }).single();
    const role = (profile as any)?.role ?? null;
    if (role !== 'client') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await context.params;
    const candidateId = id;
    const body = await req.json().catch(() => ({}));
    const notes: string = (body?.notes ?? '').toString();
    if (notes.length > 5000) return NextResponse.json({ error: 'Notes too long' }, { status: 400 });

    // Resolve candidate email first (avoid complex generic type on eq)
    const { data: candRow } = await supabase
      .from('candidates')
      .select('email')
      .match({ id: candidateId as string })
      .single();
    const candEmail: string = ((candRow as any)?.email as string) || '';

    // Find latest referral for this candidate tied to this client
    const { data: referral } = await supabase
      .from('referrals')
      .select('id, candidate_email, job:jobs!inner(client_id)')
      .match({ candidate_email: candEmail as string })
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    const refRow: any = referral as any;
    if (!refRow || refRow?.job?.client_id !== (user.id as string)) return NextResponse.json({ error: 'No access to this candidate' }, { status: 403 });

    // Store in referrals.client_notes (fallback path only)
    const { data: updated } = await supabase
      .from('referrals')
      .update({ client_notes: notes } as any)
      .eq('id', (refRow as any).id)
      .select()
      .single();

    return NextResponse.json({ ok: true, updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}


