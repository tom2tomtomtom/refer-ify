"use client";

import { useState } from "react";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signInWithLinkedIn() {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: { redirectTo: `${window.location.origin}/callback` },
    });
  }

  async function signInWithPassword(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const result = await supabase?.auth.signInWithPassword({ email, password });
      if (result?.error) throw result.error;
      window.location.href = "/";
    } catch (e: any) {
      setMessage(e?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function setDemoRole(role: "founding" | "select" | "client" | "candidate") {
    setLoading(true);
    setMessage("Setting up demo mode...");

    try {
      // Step 1: Seed demo data
      const seedResponse = await fetch('/api/demo/seed', { method: 'POST' });
      if (!seedResponse.ok) {
        console.error('Demo seed failed:', await seedResponse.text());
      }

      // Step 2: Set demo auth
      const authResponse = await fetch('/api/demo/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!authResponse.ok) {
        throw new Error('Failed to set demo mode');
      }

      const { redirect } = await authResponse.json();

      // Also set localStorage for client-side checks
      try {
        window.localStorage.setItem("demo_user_role", role);
        window.localStorage.setItem("dev_role_override", role);
      } catch {}

      // Redirect to role dashboard
      window.location.href = redirect;
    } catch (error: any) {
      console.error('Demo mode error:', error);
      setMessage(error.message || 'Failed to enter demo mode');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="space-y-8 w-full max-w-sm">
        {/* Large Brand Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="https://res.cloudinary.com/dkl8kiemy/image/upload/v1760523034/ref_log_y8ozda.png"
            alt="Refer-ify - Executive Recruitment Network"
            width={240}
            height={80}
            className="h-16 w-auto sm:h-20"
            priority
          />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Sign in to Refer-ify</h1>
          <p className="text-sm text-muted-foreground">Use email + password or LinkedIn. New here? Sign up first.</p>
        </div>

        {/* Email + Password */}
        <form onSubmit={signInWithPassword} data-testid="login-form" className="space-y-3 border rounded-md p-4 bg-white">
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <Input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" disabled={!email || !password || loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          {message && <p className="text-xs text-red-600 text-center">{message}</p>}
        </form>

        <div className="text-center">
          <Button onClick={signInWithLinkedIn} className="w-full">Continue with LinkedIn</Button>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-gray-600 text-center">Demo Mode: Choose a role below to explore the platform</p>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" onClick={() => setDemoRole("founding")} className="w-full">Demo as Founder</Button>
            <Button variant="outline" onClick={() => setDemoRole("select")} className="w-full">Demo as Referrer</Button>
            <Button variant="outline" onClick={() => setDemoRole("client")} className="w-full">Demo as Client Company</Button>
            <Button variant="outline" onClick={() => setDemoRole("candidate")} className="w-full">Demo as Candidate</Button>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Don’t have an account? <a href="/signup" className="underline">Sign up</a>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";


