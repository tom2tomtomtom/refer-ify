import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

// Creates an upload signed URL for the authenticated user to upload a resume
export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileName } = await request.json();
  if (!fileName) return NextResponse.json({ error: "fileName required" }, { status: 400 });

  const service = getSupabaseServiceClient();
  const path = `${user.id}/${Date.now()}-${fileName}`;
  const { data, error } = await service.storage
    .from("resumes")
    .createSignedUploadUrl(path);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ path, signedUrl: data.signedUrl, token: data.token });
}


