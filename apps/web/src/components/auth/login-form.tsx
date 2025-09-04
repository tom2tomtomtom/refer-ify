"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const result = await supabase?.auth.signInWithPassword({
        email,
        password,
      });
      
      const { data, error } = result || { data: null, error: null };

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data?.user) {
        toast.success("Successfully signed in!");
        
        // Get user profile to determine redirect
        const profileResult = await supabase
          ?.from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        
        const { data: profile } = profileResult || { data: null };

        // Redirect based on role
        if (profile?.role === "client") {
          router.push("/client");
        } else if (profile?.role === "candidate") {
          router.push("/candidate");
        } else if (profile?.role === "founding_circle") {
          router.push("/founding");
        } else if (profile?.role === "select_circle") {
          router.push("/select-circle");
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInLogin = async () => {
    setIsLinkedInLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const result = await supabase?.auth.signInWithOAuth({
        provider: "linkedin_oidc",
        options: {
          redirectTo: `${window.location.origin}/callback`,
        },
      });
      
      const { error } = result || { error: null };

      if (error) {
        toast.error(error.message);
        setIsLinkedInLoading(false);
      }
    } catch (error) {
      console.error("LinkedIn login error:", error);
      toast.error("LinkedIn login failed");
      setIsLinkedInLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const result = await supabase?.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });
      
      const { error } = result || { error: null };

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Magic link sent! Check your email.");
      }
    } catch (error) {
      console.error("Magic link error:", error);
      toast.error("Failed to send magic link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* LinkedIn Login */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleLinkedInLogin}
        disabled={isLinkedInLoading}
      >
        {isLinkedInLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
            />
          </svg>
        )}
        Continue with LinkedIn
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Email/Password Login */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      {/* Magic Link Option */}
      <div className="text-center">
        <Button
          type="button"
          variant="link"
          className="text-sm"
          onClick={handleMagicLink}
          disabled={isLoading || !email}
        >
          Send me a magic link instead
        </Button>
      </div>

      {/* Role Selection Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Account Types</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>Founding Circle:</strong> Elite network members</li>
          <li>• <strong>Select Circle:</strong> Trusted referrers</li>
          <li>• <strong>Client:</strong> Companies posting positions</li>
          <li>• <strong>Candidate:</strong> Executive job seekers</li>
        </ul>
      </div>
    </div>
  );
}