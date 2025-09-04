"use client";

import { useEffect, useState } from "react";
import { SettingsForm } from "@/components/shared/settings-form";
import { toast } from "sonner";

interface UserSettings {
  id?: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  two_factor_enabled: boolean;
  profile_visibility: "public" | "private" | "network";
}

export function CandidateSettingsContent() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/user/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      
      const { data } = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (updatedSettings: Partial<UserSettings>) => {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) throw new Error("Failed to save settings");
      
      const { data } = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <SettingsForm
        role="candidate"
        initialSettings={settings || undefined}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
}