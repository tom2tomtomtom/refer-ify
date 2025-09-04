"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, User, Building, MapPin, Globe } from "lucide-react";
import type { UserRole } from "@/lib/supabase/database.types";

interface UserProfile {
  id?: string;
  role: UserRole;
  email: string;
  first_name: string;
  last_name: string;
  company?: string;
  linkedin_url?: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  // Role-specific fields stored in profile_extensions
  role_data?: Record<string, any>;
}

interface ProfileFormProps {
  role: UserRole;
  initialProfile?: UserProfile;
  onSave: (profile: Partial<UserProfile>) => Promise<void>;
  isLoading?: boolean;
}

const roleSpecificFields = {
  client: {
    title: "Company Profile",
    description: "Manage your company information and hiring preferences",
    fields: [
      { id: "team_size", label: "Team Size", type: "select", options: ["1-10", "11-50", "51-200", "201-1000", "1000+"] },
      { id: "industry", label: "Industry", type: "text" },
      { id: "budget_range", label: "Typical Budget Range", type: "text" },
      { id: "hiring_frequency", label: "Hiring Frequency", type: "select", options: ["As needed", "Monthly", "Quarterly", "Annually"] },
    ],
  },
  founding_circle: {
    title: "Founding Circle Profile", 
    description: "Showcase your expertise and network",
    fields: [
      { id: "network_size", label: "Network Size", type: "number" },
      { id: "expertise_areas", label: "Areas of Expertise", type: "textarea" },
      { id: "successful_placements", label: "Successful Placements", type: "number" },
      { id: "advisory_roles", label: "Advisory Board Positions", type: "textarea" },
    ],
  },
  select_circle: {
    title: "Select Circle Profile",
    description: "Highlight your referral capabilities and expertise", 
    fields: [
      { id: "specializations", label: "Specializations", type: "textarea" },
      { id: "years_recruiting", label: "Years in Recruiting", type: "number" },
      { id: "preferred_industries", label: "Preferred Industries", type: "textarea" },
      { id: "placement_rate", label: "Placement Success Rate %", type: "number" },
    ],
  },
  candidate: {
    title: "Candidate Profile",
    description: "Build your professional profile for opportunities",
    fields: [
      { id: "current_title", label: "Current Title", type: "text" },
      { id: "years_experience", label: "Years of Experience", type: "number" },
      { id: "salary_range", label: "Salary Expectations", type: "text" },
      { id: "availability", label: "Availability", type: "select", options: ["Immediate", "2 weeks", "1 month", "3 months", "Not actively looking"] },
      { id: "skills", label: "Key Skills", type: "textarea" },
      { id: "work_authorization", label: "Work Authorization", type: "select", options: ["US Citizen", "Green Card", "H1B", "OPT", "Requires Sponsorship"] },
    ],
  },
};

export function ProfileForm({ role, initialProfile, onSave, isLoading = false }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile>(() => ({
    role,
    email: initialProfile?.email || "",
    first_name: initialProfile?.first_name || "",
    last_name: initialProfile?.last_name || "",
    company: initialProfile?.company || "",
    linkedin_url: initialProfile?.linkedin_url || "",
    phone: initialProfile?.phone || "",
    location: initialProfile?.location || "",
    bio: initialProfile?.bio || "",
    avatar_url: initialProfile?.avatar_url || "",
    role_data: initialProfile?.role_data || {},
    ...initialProfile,
  }));

  const [isSaving, setIsSaving] = useState(false);
  const roleConfig = roleSpecificFields[role];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(profile);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (key: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const updateRoleData = (key: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      role_data: { ...prev.role_data, [key]: value }
    }));
  };

  const getInitials = () => {
    return `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{roleConfig.title}</h1>
        <p className="text-gray-600 mt-2">{roleConfig.description}</p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url} alt="Profile" />
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" className="mb-2">
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Your basic profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={profile.first_name}
                onChange={(e) => updateProfile("first_name", e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={profile.last_name}
                onChange={(e) => updateProfile("last_name", e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => updateProfile("email", e.target.value)}
              placeholder="Enter your email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={profile.phone || ""}
              onChange={(e) => updateProfile("phone", e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={profile.company || ""}
              onChange={(e) => updateProfile("company", e.target.value)}
              placeholder="Enter your company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={profile.location || ""}
              onChange={(e) => updateProfile("location", e.target.value)}
              placeholder="Enter your location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
            <Input
              id="linkedin_url"
              value={profile.linkedin_url || ""}
              onChange={(e) => updateProfile("linkedin_url", e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio || ""}
              onChange={(e) => updateProfile("bio", e.target.value)}
              placeholder="Tell us about your professional background..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Role-Specific Fields */}
      {roleConfig.fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Role-Specific Information</CardTitle>
            <CardDescription>
              Information specific to your {role.replace("_", " ")} role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roleConfig.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                {field.type === "text" && (
                  <Input
                    id={field.id}
                    value={profile.role_data?.[field.id] || ""}
                    onChange={(e) => updateRoleData(field.id, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
                {field.type === "number" && (
                  <Input
                    id={field.id}
                    type="number"
                    value={profile.role_data?.[field.id] || ""}
                    onChange={(e) => updateRoleData(field.id, parseInt(e.target.value) || 0)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
                {field.type === "textarea" && (
                  <Textarea
                    id={field.id}
                    value={profile.role_data?.[field.id] || ""}
                    onChange={(e) => updateRoleData(field.id, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    rows={3}
                  />
                )}
                {field.type === "select" && field.options && (
                  <Select
                    value={profile.role_data?.[field.id] || ""}
                    onValueChange={(value) => updateRoleData(field.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
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
            "Save Profile"
          )}
        </Button>
      </div>
    </div>
  );
}