import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    console.log("No code parameter found");
    return NextResponse.redirect(new URL("/login", origin));
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Auth exchange error:", error);
      return NextResponse.redirect(new URL("/login", origin));
    }

    console.log("Auth successful:", data.user?.email);
    const redirectUrl = new URL(next, origin);
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("Callback error:", err);
    return NextResponse.redirect(new URL("/login", origin));
  }
}


