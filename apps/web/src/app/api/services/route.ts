import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type SupportTicket = Database["public"]["Tables"]["support_tickets"]["Row"];
type SupportTicketInsert = Database["public"]["Tables"]["support_tickets"]["Insert"];

// Consolidated services endpoint (billing + support)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    
    const supabase = await getSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (service === 'billing') {
      const limit = parseInt(searchParams.get("limit") || "20");
      const offset = parseInt(searchParams.get("offset") || "0");

      // Fetch payment transactions for the user
      const { data: transactions, error } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Failed to fetch transactions:", error);
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
      }

      return NextResponse.json({ 
        transactions: transactions || [],
        count: transactions?.length || 0
      });
    }

    if (service === 'support') {
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
    }

    if (service === 'billing-cancel') {
      // Handle subscription cancellation
      // This would typically integrate with Stripe or your payment provider
      // For now, we'll just mark the user's subscription as cancelled
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
      }

      // Here you would call your payment provider's API to cancel the subscription
      // Example: await stripe.subscriptions.del(subscriptionId);
      
      return NextResponse.json({ 
        message: "Subscription cancellation initiated",
        status: "pending"
      });
    }

    if (service === 'resume') {
      // Handle resume operations - consolidated from /api/core
      const referralId = searchParams.get('referral_id');
      if (!referralId) {
        return NextResponse.json({ error: "referral_id required" }, { status: 400 });
      }

      const { data: referral, error } = await supabase
        .from("referrals")
        .select("resume_url, resume_filename")
        .eq("id", referralId)
        .single();

      if (error || !referral) {
        return NextResponse.json({ error: "Referral not found" }, { status: 404 });
      }

      return NextResponse.json({ 
        resume_url: referral.resume_url,
        filename: referral.resume_filename 
      });
    }

    if (service === 'job-referrals') {
      // Handle job referrals - consolidated from /api/core
      const jobId = searchParams.get('job_id');
      if (!jobId) {
        return NextResponse.json({ error: "job_id required" }, { status: 400 });
      }

      // Verify job access
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("client_id")
        .eq("id", jobId)
        .single();

      if (jobError || !job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      if (job.client_id !== user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      const { data: referrals, error } = await supabase
        .from("referrals")
        .select(`
          id,
          candidate_name,
          candidate_email,
          status,
          created_at,
          resume_url,
          referrer:profiles!referrer_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ referrals: referrals || [] });
    }

    return NextResponse.json({ error: "Invalid service parameter" }, { status: 400 });

  } catch (error) {
    console.error("Services endpoint error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    
    const supabase = await getSupabaseServerClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (service === 'support') {
      // Create support ticket
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
    }

    if (service === 'referral-resume') {
      // Handle resume upload for referrals - consolidated from /api/core
      const { referral_id, resume_url, resume_filename } = await request.json();
      
      if (!referral_id || !resume_url) {
        return NextResponse.json({ 
          error: "referral_id and resume_url required" 
        }, { status: 400 });
      }

      const { data: referral, error } = await supabase
        .from("referrals")
        .update({
          resume_url,
          resume_filename: resume_filename || null
        })
        .eq("id", referral_id)
        .eq("referrer_id", user.id) // Ensure user owns this referral
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ referral });
    }

    return NextResponse.json({ error: "Invalid service parameter" }, { status: 400 });

  } catch (error) {
    console.error("Services POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}