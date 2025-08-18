import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = getStripeServer();
  const { priceId, customerEmail } = await request.json();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: customerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/?canceled=1`,
  });
  return NextResponse.json({ id: session.id, url: session.url });
}


