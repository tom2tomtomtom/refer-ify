"use client";

import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/shared/profile-form";
import { toast } from "sonner";
import type { UserRole } from "@/lib/supabase/database.types";

interface UserProfile {
  id?: string;
  role: UserRole;
  email: string;
  first_name: string;
  last_name: string;
  company?: string;
  linkedin_url?: string;
  role_data?: Record<string, any>;
}

export function ClientProfileContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch("/api/user/profile", { 
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error("Failed to fetch profile");
      
      const { data } = await response.json();
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      if (error.name === 'AbortError') {
        toast.error("Profile load timed out. Please try again.");
      } else {
        toast.error("Failed to load profile");
      }
      // Set demo data for development
      if (process.env.NODE_ENV === 'development') {
        setProfile({
          role: 'client' as UserRole,
          email: 'demo@example.com',
          first_name: 'Demo',
          last_name: 'User',
          company: 'Demo Company',
          linkedin_url: ''
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (updatedProfile: Partial<UserProfile>) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) throw new Error("Failed to save profile");
      
      const { data } = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Error saving profile:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ProfileForm
        role="client"
        initialProfile={profile || undefined}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
}