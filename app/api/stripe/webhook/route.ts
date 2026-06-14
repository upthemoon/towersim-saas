import { NextResponse } from "next/server";
import { stripe, mapStripeStatus } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

// Webhook は body の raw が必要なので、Next の自動 parsing は使わず手動で raw を読む。
export const runtime = "nodejs";

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  if (!sig) return new NextResponse("missing signature", { status: 400 });

  // env 未設定を実リクエスト時まで遅延検出しないよう、! 強制キャストではなく明示 throw する
  // (createSupabaseAdminClient と同方針・staging での設定漏れを早期検出)。
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not set");

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    // 署名検証失敗の詳細はサーバログにのみ残し、レスポンスには載せない。
    console.error("[stripe webhook] signature verification failed:", (err as Error).message);
    return new NextResponse("signature verification failed", { status: 400 });
  }

  try {
    // admin client 生成も try 内に置き、env 未設定時の throw を下の catch で 500 + ログ化する。
    const sb = createSupabaseAdminClient();
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
        // current_period_end は webhook が唯一の供給元 (ensureProfile / checkout は書かない)。
        // created/updated で event の subscription item が period を載せてこない (past_due 等) と
        // periodEnd=null になり得るが、それで DB を null 上書きすると「いつまで利用可能か」が消え、
        // canceled の期間末判定 (canAccessApp) まで巻き添えで壊れる。値が取れた時だけ書き、取れない
        // 時は既存値を保持する (新規行なら未設定=null で問題ない)。
        // ただし deleted は terminal なので、period が取れなければ既存値を残さず null で明示クローズ
        // する (即時解約/チャージバックで未来日が残置されアクセスが開いたままになるのを防ぐ)。
        const payload: {
          user_id: string;
          stripe_customer_id: string;
          subscription_status: typeof status;
          plan: typeof plan;
          current_period_end?: string | null;
        } = {
          user_id: userId,
          stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          subscription_status: status,
          plan,
        };
        // periodEnd===0 は理論上「即時失効」。null へ落とさず "1970-01-01" として書く方が
        // canAccessApp の「過去日ならアクセス閉」判定に正しく乗るため != null で受ける。
        if (periodEnd != null) {
          payload.current_period_end = new Date(periodEnd * 1000).toISOString();
        } else if (event.type === "customer.subscription.deleted") {
          payload.current_period_end = null;
        }
        const { error } = await sb.from("profiles").upsert(payload, { onConflict: "user_id" });
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
