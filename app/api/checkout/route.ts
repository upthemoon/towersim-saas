import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const plan = body.plan === "yearly" ? "yearly" : "monthly";
  const priceId = plan === "yearly" ? STRIPE_PRICE_YEARLY : STRIPE_PRICE_MONTHLY;

  const { data: profile } = await supabase
    .from("profiles").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();

  const origin = new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : user.email ?? undefined,
    client_reference_id: user.id,
    metadata: { user_id: user.id, plan },
    subscription_data: { metadata: { user_id: user.id, plan } },
    success_url: `${origin}/app?checkout=success`,
    cancel_url: `${origin}/billing?checkout=canceled`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
