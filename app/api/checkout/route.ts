import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { stripe, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY } from "@/lib/stripe";

export const runtime = "nodejs";

// stripe_customer_id の永続化は RLS で通常ユーザーに禁止されている（profiles の直接 update は
// Webhook=service_role 経由のみ）ため、Checkout 前の Customer 確定書き込みは service_role で行う。

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
      .from("profiles").select("stripe_customer_id, trial_ends_at").eq("user_id", user.id).maybeSingle();

    // Customer 二重作成の防止: Checkout 完了 → webhook が stripe_customer_id を書き込む前に
    // 2 回目の Checkout が走ると、profile が空のまま customer_email 経路を通り Stripe が別 Customer
    // を新規作成してしまう（先の Customer が orphan 化）。これを塞ぐため Customer は Checkout
    // セッション作成より前に確定し、service_role で profile に永続化する。idempotencyKey で
    // リトライ/レースによる二重作成自体も無害化する。
    let customerId = profile?.stripe_customer_id ?? null;
    if (!customerId) {
      // idempotencyKey は user.id 固定。同一ユーザーの customers.create を冪等化し、
      // 永続化前のリトライ/レースでの二重作成を防ぐ。email は user.email(JWT由来)で固定のため
      // キー衝突しても同一 Customer が返る。Stripe 側で 24h 失効するが、その頃には通常
      // stripe_customer_id が永続化済みで再到達しない。
      const customer = await stripe.customers.create(
        { email: user.email ?? undefined, metadata: { user_id: user.id } },
        { idempotencyKey: `cust_${user.id}` },
      );
      customerId = customer.id;
      // 永続化は service_role で行い、戻り行で 0 件更新（profile 不在）を検知する。通常は
      // /billing が先に ensureProfile を呼ぶため行は存在するが、直接 /api/checkout を叩いた等で
      // 行が無いと update は静かに 0 件成功するため、webhook 任せにせずログで可視化する。
      const { data: persisted, error: persistError } = await createSupabaseAdminClient()
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id)
        .select("user_id");
      // 永続化に失敗/0件でも Checkout 自体は止めない（webhook 側でも customer_id を upsert するため
      // 最終的に整合する）。レース窓は残るのでサーバログに記録する。
      if (persistError) {
        console.error("[/api/checkout] failed to persist stripe_customer_id:", persistError);
      } else if (!persisted || persisted.length === 0) {
        console.warn(
          "[/api/checkout] stripe_customer_id persist updated 0 rows (profile may not exist):",
          user.id,
        );
      }
    }

    // 既存の trial_ends_at を未来日なら Stripe Trial と同期 (E-4 対応・特商法「試用期間終了後に課金」と整合)
    const trialEndUnix = profile?.trial_ends_at
      ? Math.floor(new Date(profile.trial_ends_at).getTime() / 1000)
      : null;
    const nowUnix = Math.floor(Date.now() / 1000);
    const useTrial = trialEndUnix !== null && trialEndUnix > nowUnix;

    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customerId ?? undefined,
      customer_email: customerId ? undefined : user.email ?? undefined,
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan },
      subscription_data: {
        metadata: { user_id: user.id, plan },
        ...(useTrial && trialEndUnix !== null ? { trial_end: trialEndUnix } : {}),
      },
      // B-2: Webhook 反映前のレース回避・/billing に着地させて「処理中」メッセージを表示
      success_url: `${origin}/billing?checkout=success`,
      cancel_url: `${origin}/billing?checkout=canceled`,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json({ error: "stripe_session_missing_url" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e: unknown) {
    // 内部情報 (Stripe/DB の生メッセージ・コード・type) はクライアントに返さずサーバログに閉じる。
    console.error("[/api/checkout] error:", e);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
