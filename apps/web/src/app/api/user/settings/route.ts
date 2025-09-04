import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];
type UserSettingsInsert = Database["public"]["Tables"]["user_settings"]["Insert"];

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

  } catch (error) {
    console.error("Unexpected error fetching user settings:", error);
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

  } catch (error) {
    console.error("Unexpected error saving user settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Alias POST to PUT for convenience
  return PUT(request);
}