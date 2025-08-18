import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;

  try {
    const body = await request.json();
    const { status, referrer_notes } = body;
    const { data, error } = await supabase
      .from("referrals")
      .update({ status, referrer_notes } as any)
      .match({ id: id as string })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ referral: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


