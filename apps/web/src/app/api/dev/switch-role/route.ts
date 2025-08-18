import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const devEmail = process.env.NEXT_PUBLIC_DEV_SUPERUSER_EMAIL;
  if (!devEmail || user.email !== devEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { role } = await request.json();
  if (!role) return NextResponse.json({ error: "role is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", user.id)
    .select("id, role")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}


