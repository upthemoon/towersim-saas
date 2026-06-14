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
    // 署名検証失敗の詳細はサーバログにのみ残し、レスポンスには載せない。
    console.error("[stripe webhook] signature verification failed:", (err as Error).message);
    return new NextResponse("signature verification failed", { status: 400 });
  }

  const sb = adminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id ?? session.client_reference_id;
        if (!userId) {
          console.warn("[stripe webhook] checkout.session.completed without user_id: session=%s", session.id);
          break;
        }
        // Stripe Customer ID を profile に紐づけ。subscription は customer.subscription.created で処理。
        if (session.customer) {
          const { error } = await sb.from("profiles").upsert({
            user_id: userId,
            stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer.id,
          }, { onConflict: "user_id" });
          // 書き込み失敗を 200 で握りつぶさず throw → 下の catch で 500 → Stripe が再送する。
          if (error) throw error;
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (!userId) {
          // 課金は成立しているのに紐付けできないケースを検知可能にする (Dashboard 手動作成等)。
          console.warn(
            "[stripe webhook] subscription event without user_id metadata: sub=%s customer=%s",
            sub.id, typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
          );
          break;
        }
        // 期間末解約の予約 (cancel_at_period_end) は Stripe 上 status=active のままなので、
        // UI と整合させるため canceled 扱いにする (canAccessApp は current_period_end まで許可)。
        const status = event.type === "customer.subscription.deleted"
          ? "canceled"
          : sub.cancel_at_period_end
            ? "canceled"
            : mapStripeStatus(sub.status);
        const plan = sub.metadata?.plan === "yearly" ? "yearly" : "monthly";
        // Stripe SDK v22 (apiVersion 2026-04-22.dahlia) では current_period_end は
        // Subscription 本体から subscription item 側へ移動している。item から取得する。
        // TowerSim は単一プランのため items.data[0] で十分 (複数 item 化する場合は要見直し)。
        const item = sub.items?.data?.[0];
        const periodEnd =
          item?.current_period_end
          ?? (sub as unknown as { current_period_end?: number }).current_period_end
          ?? null;
        const { error } = await sb.from("profiles").upsert({
          user_id: userId,
          stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          subscription_status: status,
          plan,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        }, { onConflict: "user_id" });
        if (error) {
          // 削除済ユーザーへの FK 違反 (23503) は再送しても無駄なので 200 で無視。それ以外は再送。
          if ((error as { code?: string }).code === "23503") {
            console.warn("[stripe webhook] profile gone (deleted user), skip sub=%s", sub.id);
          } else {
            throw error;
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", err);
    return new NextResponse("handler error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
