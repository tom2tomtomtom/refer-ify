"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function signUpWithLinkedIn() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
  }

  async function signUpWithEmail() {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });
      if (error) throw error;
      setMessage("Check your email to confirm your account, then sign in with your password.");
    } catch (e: any) {
      setMessage(e?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function resendConfirmation() {
    setResending(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      setMessage('Confirmation email re-sent. Please check your inbox.');
    } catch (e: any) {
      setMessage(e?.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="space-y-6 w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center">Create your account</h1>

        <div className="space-y-3 border rounded-md p-4 bg-white">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button onClick={signUpWithEmail} disabled={!email || !password || loading} className="w-full">
            {loading ? "Creating..." : "Sign up"}
          </Button>
          {message && (
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-600">{message}</p>
              <Button variant="outline" size="sm" onClick={resendConfirmation} disabled={!email || resending}>
                {resending ? 'Resending…' : 'Resend confirmation'}
              </Button>
            </div>
          )}
        </div>

        <div className="text-center">
          <Button onClick={signUpWithLinkedIn} className="w-full">Continue with LinkedIn</Button>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";


