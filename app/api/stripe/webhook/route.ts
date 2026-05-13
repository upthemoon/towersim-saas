import { NextResponse } from "next/server";
import { stripe, mapStripeStatus } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

// Webhook は body の raw が必要なので、Next の自動 parsing は使わず手動で raw を読む。
export const runtime = "nodejs";

const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  if (!sig) return new NextResponse("missing signature", { status: 400 });

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, WEBHOOK_SECRET);
  } catch (err) {
    return new NextResponse(`signature verification failed: ${(err as Error).message}`, { status: 400 });
  }

  const sb = adminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id ?? session.client_reference_id;
        if (!userId) break;
        // Stripe Customer ID を profile に紐づけ。subscription は customer.subscription.created で処理。
        if (session.customer) {
          await sb.from("profiles").upsert({
            user_id: userId,
            stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer.id,
          }, { onConflict: "user_id" });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (!userId) break;
        const status = event.type === "customer.subscription.deleted" ? "canceled" : mapStripeStatus(sub.status);
        const plan = sub.metadata?.plan === "yearly" ? "yearly" : "monthly";
        // current_period_end は Stripe API 上、subscription オブジェクトの items に入る場合あり。
        // ここでは Stripe.Subscription の current_period_end (UNIX 秒) を使う。
        const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;
        await sb.from("profiles").upsert({
          user_id: userId,
          stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          subscription_status: status,
          plan,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        }, { onConflict: "user_id" });
        break;
      }
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", err);
    return new NextResponse("handler error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
