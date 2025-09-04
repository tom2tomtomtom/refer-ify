"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AuthCallback() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = getSupabaseBrowserClient();

        // Get the session from the URL fragments or search params
        const result = await supabase?.auth.getSession();
        const { data, error } = result || { data: null, error: null };

        if (error) {
          console.error("Auth callback error:", error);
          setError(error.message);
          toast.error(error.message);
          return;
        }

        if (data?.session) {
          // Get user profile to determine redirect
          const profileResult = await supabase
            ?.from("profiles")
            .select("role")
            .eq("id", data.session.user.id)
            .single();
          
          const { data: profile, error: profileError } = profileResult || { data: null, error: null };

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            // If no profile exists, redirect to role selection or onboarding
            router.push("/onboarding");
            return;
          }

          // Redirect based on role
          let redirectPath = "/";
          
          switch (profile?.role) {
            case "client":
              redirectPath = "/client";
              break;
            case "candidate":
              redirectPath = "/candidate";
              break;
            case "founding_circle":
              redirectPath = "/founding";
              break;
            case "select_circle":
              redirectPath = "/select-circle";
              break;
            default:
              redirectPath = "/";
          }

          toast.success("Successfully signed in!");
          router.push(redirectPath);
        } else {
          // No session found, redirect to login
          setError("Authentication failed. Please try again.");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        }
      } catch (err) {
        console.error("Unexpected auth callback error:", err);
        setError("An unexpected error occurred. Please try again.");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="text-red-600 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Error
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-blue-600 mb-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Completing Sign In
          </h2>
          <p className="text-gray-600">
            Please wait while we set up your account...
          </p>
        </div>
      </div>
    </div>
  );
}