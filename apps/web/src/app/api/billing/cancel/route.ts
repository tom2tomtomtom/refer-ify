import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const stripe = getStripeServer();
    const supabase = await getSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscription_id } = await request.json();

    if (!subscription_id) {
      return NextResponse.json({ error: "Subscription ID required" }, { status: 400 });
    }

    // Cancel subscription in Stripe
    const cancelledSubscription = await stripe.subscriptions.update(subscription_id, {
      cancel_at_period_end: true
    });

    // Update subscription status in database
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ 
        status: "cancelled",
        // Keep the subscription active until period ends
      })
      .eq("stripe_subscription_id", subscription_id)
      .eq("client_id", user.id);

    if (updateError) {
      console.error("Failed to update subscription status:", updateError);
      return NextResponse.json({ 
        error: "Failed to update subscription status" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Subscription will be cancelled at the end of the billing period",
      cancels_at: new Date(cancelledSubscription.current_period_end * 1000).toISOString()
    });

  } catch (error) {
    console.error("Subscription cancellation error:", error);
    return NextResponse.json({ 
      error: "Failed to cancel subscription" 
    }, { status: 500 });
  }
}