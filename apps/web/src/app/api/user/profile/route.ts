import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type ProfileExtension = Database["public"]["Tables"]["profile_extensions"]["Row"];
type ProfileExtensionInsert = Database["public"]["Tables"]["profile_extensions"]["Insert"];

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

  } catch (error) {
    console.error("Unexpected error fetching user profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
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

  } catch (error) {
    console.error("Unexpected error updating user profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Alias POST to PUT for convenience
  return PUT(request);
}