import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type ProfileExtension = Database["public"]["Tables"]["profile_extensions"]["Row"];
type ProfileExtensionInsert = Database["public"]["Tables"]["profile_extensions"]["Insert"];
type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];
type UserSettingsInsert = Database["public"]["Tables"]["user_settings"]["Insert"];

// Consolidated user account endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'profile';
    
    const supabase = await getSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (type === 'profile') {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
      }

      // Get profile extensions for role-specific data
      const { data: extensions, error: extensionsError } = await supabase
        .from("profile_extensions")
        .select("*")
        .eq("user_id", user.id);

      if (extensionsError) {
        console.error("Error fetching profile extensions:", extensionsError);
        // Continue without extensions data
      }

      // Combine profile with extensions
      const roleExtension = extensions?.find(ext => ext.role === profile.role);
      const combinedProfile = {
        ...profile,
        role_data: roleExtension?.data || {},
      };

      return NextResponse.json({ data: combinedProfile });
    }

    if (type === 'settings') {
      // Get user settings
      const { data: settings, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // If no settings exist, return default settings
        if (error.code === "PGRST116") {
          const defaultSettings = {
            user_id: user.id,
            email_notifications: true,
            push_notifications: true,
            marketing_emails: false,
            two_factor_enabled: false,
            profile_visibility: "public" as const,
          };
          return NextResponse.json({ data: defaultSettings });
        }
        
        console.error("Error fetching user settings:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
      }

      return NextResponse.json({ data: settings });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });

  } catch (error) {
    console.error("Unexpected error fetching user data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'profile';
    
    const supabase = await getSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    if (type === 'profile') {
      const {
        first_name,
        last_name,
        company,
        linkedin_url,
        role_data,
        phone,
        location,
        bio,
        avatar_url,
        ...otherFields
      } = body;

      // Update main profile
      const profileUpdate: ProfileUpdate = {
        first_name: first_name || null,
        last_name: last_name || null,
        company: company || null,
        linkedin_url: linkedin_url || null,
      };

      // Remove undefined values
      Object.keys(profileUpdate).forEach(key => {
        if (profileUpdate[key as keyof ProfileUpdate] === undefined) {
          delete profileUpdate[key as keyof ProfileUpdate];
        }
      });

      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id)
        .select()
        .single();

      if (profileError) {
        console.error("Error updating profile:", profileError);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
      }

      // Update or create role-specific data if provided
      if (role_data && updatedProfile.role) {
        const extensionData: ProfileExtensionInsert = {
          user_id: user.id,
          role: updatedProfile.role,
          data: role_data,
        };

        const { error: extensionError } = await supabase
          .from("profile_extensions")
          .upsert(extensionData, {
            onConflict: "user_id,role",
            ignoreDuplicates: false
          });

        if (extensionError) {
          console.error("Error updating profile extensions:", extensionError);
          // Continue even if extension update fails
        }
      }

      // Fetch complete updated profile
      const { data: extensions, error: extensionsError } = await supabase
        .from("profile_extensions")
        .select("*")
        .eq("user_id", user.id);

      const roleExtension = extensions?.find(ext => ext.role === updatedProfile.role);
      const combinedProfile = {
        ...updatedProfile,
        role_data: roleExtension?.data || {},
      };

      return NextResponse.json({ data: combinedProfile });
    }

    if (type === 'settings') {
      const {
        email_notifications,
        push_notifications,
        marketing_emails,
        two_factor_enabled,
        profile_visibility
      } = body;

      // Validate profile_visibility
      if (profile_visibility && !['public', 'private', 'network'].includes(profile_visibility)) {
        return NextResponse.json({ error: "Invalid profile visibility value" }, { status: 400 });
      }

      const settingsData: UserSettingsInsert = {
        user_id: user.id,
        email_notifications: email_notifications ?? true,
        push_notifications: push_notifications ?? true,
        marketing_emails: marketing_emails ?? false,
        two_factor_enabled: two_factor_enabled ?? false,
        profile_visibility: profile_visibility ?? "public",
      };

      // Use upsert to handle both insert and update
      const { data: settings, error } = await supabase
        .from("user_settings")
        .upsert(settingsData, {
          onConflict: "user_id",
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error("Error upserting user settings:", error);
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
      }

      return NextResponse.json({ data: settings });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });

  } catch (error) {
    console.error("Unexpected error updating user data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Alias POST to PUT for convenience
  return PUT(request);
}