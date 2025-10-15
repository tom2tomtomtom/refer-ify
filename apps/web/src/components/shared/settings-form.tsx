"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Shield, Bell, Eye, Mail } from "lucide-react";
import type { UserRole } from "@/lib/supabase/database.types";

interface UserSettings {
  id?: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  two_factor_enabled: boolean;
  profile_visibility: "public" | "private" | "network";
}

interface SettingsFormProps {
  role: UserRole;
  initialSettings?: UserSettings;
  onSave: (settings: Partial<UserSettings>) => Promise<void>;
  isLoading?: boolean;
}

const roleSpecificSettings = {
  client: {
    title: "Client Settings",
    description: "Manage your company account preferences and notifications",
    additionalOptions: [
      { id: "job_posting_notifications", label: "Job posting reminders", icon: Bell },
      { id: "candidate_updates", label: "Candidate update notifications", icon: Mail },
    ],
  },
  founding_circle: {
    title: "Founder Settings",
    description: "Configure your network and revenue sharing preferences",
    additionalOptions: [
      { id: "network_updates", label: "Network activity notifications", icon: Bell },
      { id: "revenue_reports", label: "Monthly revenue reports", icon: Mail },
    ],
  },
  select_circle: {
    title: "Referrer Settings",
    description: "Manage your referral and earnings notification preferences",
    additionalOptions: [
      { id: "referral_notifications", label: "New referral opportunities", icon: Bell },
      { id: "earnings_updates", label: "Earnings and payment updates", icon: Mail },
    ],
  },
  candidate: {
    title: "Candidate Settings",
    description: "Control your job alerts and profile visibility",
    additionalOptions: [
      { id: "job_alerts", label: "Job opportunity alerts", icon: Bell },
      { id: "interview_reminders", label: "Interview reminders", icon: Mail },
    ],
  },
};

export function SettingsForm({ role, initialSettings, onSave, isLoading = false }: SettingsFormProps) {
  const [settings, setSettings] = useState<UserSettings>(() => ({
    user_id: initialSettings?.user_id || "",
    email_notifications: initialSettings?.email_notifications ?? true,
    push_notifications: initialSettings?.push_notifications ?? true,
    marketing_emails: initialSettings?.marketing_emails ?? false,
    two_factor_enabled: initialSettings?.two_factor_enabled ?? false,
    profile_visibility: initialSettings?.profile_visibility ?? "public",
    ...initialSettings,
  }));

  const [isSaving, setIsSaving] = useState(false);
  const roleConfig = roleSpecificSettings[role];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{roleConfig.title}</h1>
        <p className="text-gray-600 mt-2">{roleConfig.description}</p>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified about important updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={settings.email_notifications}
              onCheckedChange={(checked) => updateSetting("email_notifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-gray-500">Receive browser push notifications</p>
            </div>
            <Switch
              checked={settings.push_notifications}
              onCheckedChange={(checked) => updateSetting("push_notifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-gray-500">Receive promotional emails and updates</p>
            </div>
            <Switch
              checked={settings.marketing_emails}
              onCheckedChange={(checked) => updateSetting("marketing_emails", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control who can see your profile and information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Visibility</Label>
            <Select
              value={settings.profile_visibility}
              onValueChange={(value) => updateSetting("profile_visibility", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Visible to everyone</SelectItem>
                <SelectItem value="network">Network - Visible to your network only</SelectItem>
                <SelectItem value="private">Private - Only visible to you</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Enhance your account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <Switch
              checked={settings.two_factor_enabled}
              onCheckedChange={(checked) => updateSetting("two_factor_enabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Role-Specific Settings */}
      {roleConfig.additionalOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Role-Specific Preferences</CardTitle>
            <CardDescription>
              Settings specific to your {role.replace("_", " ")} role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roleConfig.additionalOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.id} className="flex items-center justify-between">
                  <div className="space-y-0.5 flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <Label>{option.label}</Label>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
}