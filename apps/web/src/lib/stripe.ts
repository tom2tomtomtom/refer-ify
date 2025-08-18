import Stripe from "stripe";
import { loadStripe } from "@stripe/stripe-js";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  // Do not throw at import time in Next.js; throw when used
}

export function getStripeServer() {
  if (!secretKey) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(secretKey, {
    apiVersion: "2023-08-16",
    typescript: true,
  });
}

// Client-side Stripe instance
export async function getStripe() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    return null;
  }

  // Use global caching to match test expectations
  if (!(global as any).__stripe) {
    (global as any).__stripe = loadStripe(publishableKey).catch(() => null);
  }

  try {
    return await (global as any).__stripe;
  } catch (error) {
    return null;
  }
}


