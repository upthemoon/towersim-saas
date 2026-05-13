import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!STRIPE_PRICE_MONTHLY || !STRIPE_PRICE_YEARLY) {
      return NextResponse.json({ error: "stripe_price_ids_not_configured" }, { status: 500 });
    }

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

    if (!session.url) {
      return NextResponse.json({ error: "stripe_session_missing_url" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e: unknown) {
    const err = e as { message?: string; code?: string; type?: string };
    console.error("[/api/checkout] error:", err);
    return NextResponse.json({
      error: err.message ?? "checkout_failed",
      code: err.code,
      type: err.type,
    }, { status: 500 });
  }
}
