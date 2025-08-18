import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeServer } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const stripe = getStripeServer();
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret || !signature) {
    return NextResponse.json({}, { status: 401 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;
        
        if (!metadata || !metadata.type || !metadata.client_id) {
          console.error("Missing metadata in checkout session:", session.id);
          break;
        }

        if (metadata.type === "job_posting") {
          // Handle job posting payment
          await handleJobPostingPayment(supabase, session, metadata);
        } else if (metadata.type === "subscription") {
          // Handle subscription creation
          await handleSubscriptionPayment(supabase, session, metadata);
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(supabase, subscription);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(supabase, subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(supabase, invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper functions for webhook processing
async function handleJobPostingPayment(
  supabase: any, 
  session: Stripe.Checkout.Session, 
  metadata: any
) {
  // Create transaction record for job posting payment
  const { error } = await supabase
    .from("payment_transactions")
    .insert({
      client_id: metadata.client_id,
      stripe_session_id: session.id,
      amount: session.amount_total,
      currency: session.currency,
      type: "job_posting",
      subscription_tier: metadata.subscription_tier,
      status: "completed",
      metadata: {
        job_title: metadata.job_title,
        subscription_tier: metadata.subscription_tier
      }
    });

  if (error) {
    console.error("Failed to record job posting payment:", error);
  } else {
    console.log("Job posting payment recorded:", session.id);
  }
}

async function handleSubscriptionPayment(
  supabase: any, 
  session: Stripe.Checkout.Session, 
  metadata: any
) {
  if (!session.subscription) return;

  // Create or update subscription record
  const { error } = await supabase
    .from("subscriptions")
    .upsert({
      client_id: metadata.client_id,
      stripe_subscription_id: session.subscription,
      tier: metadata.subscription_tier,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    });

  if (error) {
    console.error("Failed to create subscription:", error);
  } else {
    console.log("Subscription created:", session.subscription);
  }
}

async function handleSubscriptionCreated(supabase: any, subscription: Stripe.Subscription) {
  // Update subscription with actual Stripe data
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Failed to update subscription:", error);
  }
}

async function handleSubscriptionUpdated(supabase: any, subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Failed to update subscription:", error);
  }
}

async function handleSubscriptionCancelled(supabase: any, subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Failed to cancel subscription:", error);
  }
}

async function handlePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  // Record successful payment
  const { error } = await supabase
    .from("payment_transactions")
    .insert({
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      type: "subscription",
      status: "completed"
    });

  if (error) {
    console.error("Failed to record payment:", error);
  }
}

async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  // Mark subscription as past_due
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", invoice.subscription);

  if (error) {
    console.error("Failed to update subscription status:", error);
  }
}


