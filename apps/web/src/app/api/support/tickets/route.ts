import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type SupportTicket = Database["public"]["Tables"]["support_tickets"]["Row"];
type SupportTicketInsert = Database["public"]["Tables"]["support_tickets"]["Insert"];

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's support tickets
    const { data: tickets, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching support tickets:", error);
      return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
    }

    return NextResponse.json({ data: tickets });

  } catch (error) {
    console.error("Unexpected error fetching support tickets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { subject, description, priority = "medium" } = body;

    // Validate required fields
    if (!subject?.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    if (!description?.trim()) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    // Validate priority
    if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return NextResponse.json({ error: "Invalid priority value" }, { status: 400 });
    }

    const ticketData: SupportTicketInsert = {
      user_id: user.id,
      subject: subject.trim(),
      description: description.trim(),
      priority: priority,
      status: "open",
    };

    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert(ticketData)
      .select()
      .single();

    if (error) {
      console.error("Error creating support ticket:", error);
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }

    return NextResponse.json({ data: ticket }, { status: 201 });

  } catch (error) {
    console.error("Unexpected error creating support ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}