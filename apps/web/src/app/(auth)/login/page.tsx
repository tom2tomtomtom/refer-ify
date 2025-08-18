"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function signInWithLinkedIn() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
  }

  async function sendMagicLink() {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Check your email for the magic link!");
      }
    } catch (err) {
      setMessage(`Error: ${err}`);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="space-y-6 w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center">Sign in to Refer-ify</h1>

        <div className="space-y-2 border rounded-md p-4">
          <Label htmlFor="email">Email (Magic Link)</Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={sendMagicLink} disabled={!email}>
              Send Link
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enable Email (Magic Link) provider in Supabase Auth to use this fallback.
          </p>
          {message && (
            <p className="text-sm text-blue-600">{message}</p>
          )}
        </div>

        <div className="text-center">
          <Button onClick={signInWithLinkedIn}>Continue with LinkedIn</Button>
          <p className="text-xs text-muted-foreground mt-2">If LinkedIn is temporarily unavailable, use the email magic link above.</p>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";


