"use client";

import { useState } from "react";
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

  function setDemoRole(role: "founding" | "select" | "client" | "candidate") {
    try {
      window.localStorage.setItem("demo_user_role", role);
      window.localStorage.setItem("dev_role_override", role);
      document.cookie = `dev_role_override=${role}; Max-Age=${60 * 60 * 24 * 7}; Path=/; SameSite=Lax`;
    } catch {}
    const redirect = role === "founding" ? "/founding-circle" : 
                     role === "select" ? "/select-circle" : 
                     role === "candidate" ? "/candidate" : "/client";
    window.location.href = redirect;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="space-y-8 w-full max-w-sm">
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
            <Button variant="outline" onClick={() => setDemoRole("founding")} className="w-full">Demo as Founding Circle</Button>
            <Button variant="outline" onClick={() => setDemoRole("select")} className="w-full">Demo as Select Circle</Button>
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


