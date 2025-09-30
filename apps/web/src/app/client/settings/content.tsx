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

export function ClientSettingsContent() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch("/api/user/settings", {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error("Failed to fetch settings");
      
      const { data } = await response.json();
      setSettings(data);
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      if (error.name === 'AbortError') {
        toast.error("Settings load timed out. Please try again.");
      } else {
        toast.error("Failed to load settings");
      }
      // Set demo data for development
      if (process.env.NODE_ENV === 'development') {
        setSettings({
          user_id: 'demo-user',
          email_notifications: true,
          push_notifications: false,
          marketing_emails: false,
          two_factor_enabled: false,
          profile_visibility: 'network'
        });
      }
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
      throw error; // Let SettingsForm handle the error display
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
        role="client"
        initialSettings={settings || undefined}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
}