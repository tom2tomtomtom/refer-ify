import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// Ultra-consolidated endpoint for various operations
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const operation = searchParams.get('op');
  const supabase = await getSupabaseServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    switch (operation) {
      case 'resume': {
        // Handle resume operations - replace /api/referrals/[id]/resume
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

      case 'job-referrals': {
        // Handle job referrals - replace /api/jobs/[id]/referrals
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

      default:
        return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
    }
  } catch (error) {
    console.error("Core API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const operation = searchParams.get('op');
  const supabase = await getSupabaseServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    switch (operation) {
      case 'referral-resume': {
        // Handle resume upload for referrals
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

      default:
        return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
    }
  } catch (error) {
    console.error("Core API POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}