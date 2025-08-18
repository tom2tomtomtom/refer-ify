import Stripe from "stripe";

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


