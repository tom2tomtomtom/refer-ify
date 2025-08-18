"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  async function signUpWithLinkedIn() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-semibold">Join Refer-ify</h1>
        <Button onClick={signUpWithLinkedIn}>Continue with LinkedIn</Button>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";


