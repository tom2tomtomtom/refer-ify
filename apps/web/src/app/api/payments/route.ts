import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Subscription tier pricing (in cents)
const TIER_PRICING = {
  connect: { amount: 50000, name: "Connect Plan" },      // $500
  priority: { amount: 150000, name: "Priority Plan" },   // $1500
  exclusive: { amount: 300000, name: "Exclusive Plan" }  // $3000
};

export async function POST(request: Request) {
  try {
    const stripe = getStripeServer();
    const supabase = await getSupabaseServerClient();
    
    const { 
      type, 
      subscription_tier, 
      customerEmail, 
      job_data,
      client_id 
    } = await request.json();

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate subscription tier
    if (!TIER_PRICING[subscription_tier as keyof typeof TIER_PRICING]) {
      return NextResponse.json({ error: "Invalid subscription tier" }, { status: 400 });
    }

    const tierConfig = TIER_PRICING[subscription_tier as keyof typeof TIER_PRICING];

    if (type === "job_posting") {
      // Create one-time payment for job posting
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: customerEmail,
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `Job Posting - ${tierConfig.name}`,
              description: `Post a job with ${subscription_tier} tier features`,
            },
            unit_amount: tierConfig.amount,
          },
          quantity: 1,
        }],
        metadata: {
          type: "job_posting",
          subscription_tier,
          client_id: client_id || user.id,
          job_title: job_data?.title || "New Job Posting"
        },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/client/jobs?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/client/post-job?payment=cancelled`,
      });

      return NextResponse.json({ 
        sessionId: session.id, 
        url: session.url,
        type: "job_posting"
      });

    } else if (type === "subscription") {
      // Create recurring subscription
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: customerEmail,
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: tierConfig.name,
              description: `Monthly ${subscription_tier} subscription`,
            },
            unit_amount: tierConfig.amount,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        }],
        metadata: {
          type: "subscription",
          subscription_tier,
          client_id: client_id || user.id
        },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/client/billing?subscription=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/client/billing?subscription=cancelled`,
      });

      return NextResponse.json({ 
        sessionId: session.id, 
        url: session.url,
        type: "subscription"
      });
    }

    return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });

  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json({ 
      error: "Failed to create payment session" 
    }, { status: 500 });
  }
}

// Get subscription status for a client
export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("client_id");

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("client_id", clientId || user.id)
      .eq("status", "active")
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json({ 
      subscription: subscription || null,
      has_active_subscription: !!subscription 
    });

  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch subscription" 
    }, { status: 500 });
  }
}


