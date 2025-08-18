import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED = ['submitted','reviewed','shortlisted','interviewing','hired','rejected'] as const;

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").match({ id: user.id as string }).single();
    const role = (profile as any)?.role ?? null;
    if (role !== 'client') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const target: string = (body?.status ?? '').toString();
    if (!ALLOWED.includes(target as any)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

    const { id: candidateId } = await context.params;

    // Resolve candidate email first and then locate referral for this candidate owned by this client
    const { data: candRow } = await supabase
      .from('candidates')
      .select('email')
      .match({ id: candidateId as string })
      .single();

    const { data: referral } = await supabase
      .from('referrals')
      .select('id, status, candidate_email, job:jobs!inner(client_id)')
      .match({ candidate_email: (candRow as any)?.email || '' })
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    const refRow: any = referral as any;
    if (!refRow || refRow?.job?.client_id !== (user.id as string)) return NextResponse.json({ error: 'No access to this candidate' }, { status: 403 });

    // Basic transition guard (example; can be extended)
    const currentStatus = (refRow as any)?.status as string | undefined;
    const idx = ALLOWED.indexOf((currentStatus as any) ?? 'submitted');
    const nextIdx = ALLOWED.indexOf(target as any);
    if (idx !== -1 && nextIdx !== -1 && nextIdx < idx && !['rejected'].includes(target)) {
      return NextResponse.json({ error: 'Invalid transition' }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from('referrals')
      .update({ status: target } as any)
      .eq('id', (refRow as any).id)
      .select()
      .single();
    if (error) throw error;

    // If you have a trigger to insert into status_history, it should fire on update.
    return NextResponse.json({ ok: true, referral: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}


