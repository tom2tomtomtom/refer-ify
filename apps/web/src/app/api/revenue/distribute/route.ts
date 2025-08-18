import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Revenue distribution percentages as per business model
const REVENUE_SPLIT = {
  PLATFORM: 0.45,    // 45%
  SELECT: 0.40,      // 40% 
  FOUNDING: 0.15     // 15%
};

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      referral_id, 
      placement_fee, 
      currency = "USD" 
    } = await request.json();

    if (!referral_id || !placement_fee) {
      return NextResponse.json({ 
        error: "Referral ID and placement fee are required" 
      }, { status: 400 });
    }

    // Get referral details to find the referring members
    const { data: referral, error: referralError } = await supabase
      .from("referrals")
      .select(`
        *,
        jobs!inner(client_id)
      `)
      .eq("id", referral_id)
      .single();

    if (referralError || !referral) {
      return NextResponse.json({ 
        error: "Referral not found" 
      }, { status: 404 });
    }

    // Get referrer profile to determine their role
    const { data: referrer, error: referrerError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", referral.referrer_id)
      .single();

    if (referrerError || !referrer) {
      return NextResponse.json({ 
        error: "Referrer not found" 
      }, { status: 404 });
    }

    // Calculate revenue distribution
    const platformShare = Math.round(placement_fee * REVENUE_SPLIT.PLATFORM);
    const selectShare = Math.round(placement_fee * REVENUE_SPLIT.SELECT);
    const foundingShare = Math.round(placement_fee * REVENUE_SPLIT.FOUNDING);

    // Find a founding circle member to receive founding share
    // In a real implementation, this would use a more sophisticated algorithm
    const { data: foundingMember, error: foundingError } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "founding_circle")
      .limit(1)
      .single();

    let founding_member_id = null;
    let select_member_id = null;

    // Determine member assignments based on referrer role
    if (referrer.role === "founding_circle") {
      founding_member_id = referrer.id;
      // Find a select circle member for the select share
      const { data: selectMember } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "select_circle")
        .limit(1)
        .single();
      select_member_id = selectMember?.id || null;
    } else if (referrer.role === "select_circle") {
      select_member_id = referrer.id;
      founding_member_id = foundingMember?.id || null;
    } else {
      // For other roles, assign to existing members
      founding_member_id = foundingMember?.id || null;
      const { data: selectMember } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "select_circle")
        .limit(1)
        .single();
      select_member_id = selectMember?.id || null;
    }

    // Create revenue distribution record
    const { data: distribution, error: distributionError } = await supabase
      .from("revenue_distributions")
      .insert({
        referral_id,
        founding_member_id,
        select_member_id,
        placement_fee,
        platform_share: platformShare,
        select_share: selectShare,
        founding_share: foundingShare,
        status: "calculated"
      })
      .select()
      .single();

    if (distributionError) {
      console.error("Failed to create revenue distribution:", distributionError);
      return NextResponse.json({ 
        error: "Failed to calculate revenue distribution" 
      }, { status: 500 });
    }

    // Update referral status to indicate successful placement
    const { error: updateError } = await supabase
      .from("referrals")
      .update({ 
        status: "hired",
        // Add placement fee to referral record
        metadata: { 
          placement_fee, 
          currency,
          revenue_distribution_id: distribution.id 
        }
      })
      .eq("id", referral_id);

    if (updateError) {
      console.error("Failed to update referral status:", updateError);
    }

    return NextResponse.json({
      success: true,
      distribution: {
        id: distribution.id,
        referral_id,
        total_fee: placement_fee,
        currency,
        breakdown: {
          platform: { amount: platformShare, percentage: REVENUE_SPLIT.PLATFORM * 100 },
          select: { 
            amount: selectShare, 
            percentage: REVENUE_SPLIT.SELECT * 100,
            member_id: select_member_id 
          },
          founding: { 
            amount: foundingShare, 
            percentage: REVENUE_SPLIT.FOUNDING * 100,
            member_id: founding_member_id 
          }
        },
        status: "calculated"
      }
    });

  } catch (error) {
    console.error("Revenue distribution error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// Get revenue distributions for a user
export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("revenue_distributions")
      .select(`
        *,
        referrals(
          candidate_email,
          jobs(title, client_id)
        )
      `)
      .or(`founding_member_id.eq.${user.id},select_member_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: distributions, error } = await query;

    if (error) {
      console.error("Failed to fetch revenue distributions:", error);
      return NextResponse.json({ 
        error: "Failed to fetch revenue distributions" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      distributions: distributions || [],
      count: distributions?.length || 0
    });

  } catch (error) {
    console.error("Revenue fetch error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}