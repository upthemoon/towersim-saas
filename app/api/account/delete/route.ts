import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * 自分のアカウントを完全削除する (self-serve)。
 * フロー:
 *  1. cookie セッションで本人確認 (他人のアカウントは削除不可能)
 *  2. 有効な Stripe サブスクがあれば即キャンセル (削除後の課金事故防止)
 *  3. 認証ユーザーを削除 (service_role) → profiles / scenarios は FK on delete cascade で連動削除
 * クライアント側で signOut + トップ遷移する前提。
 *
 * 注: CSRF は Supabase 認証 cookie が SameSite=Lax のため、クロスサイト POST では
 * cookie が送られず getUser() が null → 401 になることで防御される。
 */
export async function POST() {
  try {
    // 1. 本人確認
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const admin = createSupabaseAdminClient();

    // 2. Stripe 顧客の有効なサブスクを即キャンセル
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let stripeCanceled = false;
    if (profile?.stripe_customer_id) {
      try {
        // 個人 SaaS のため 1 顧客のサブスク数は Stripe デフォルト 100 件未満の前提。
        // 将来 100 件を超え得る設計にするなら autoPagingEach に変更すること。
        const subs = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: "all",
          limit: 100,
        });
        const cancelable = new Set(["active", "trialing", "past_due", "unpaid", "paused"]);
        for (const sub of subs.data) {
          if (cancelable.has(sub.status)) {
            // idempotencyKey で連打/再試行による多重キャンセルを無害化。
            await stripe.subscriptions.cancel(sub.id, undefined, {
              idempotencyKey: `acctdel-${user.id}-${sub.id}`,
            });
            stripeCanceled = true;
          }
        }
      } catch (e) {
        // Stripe 側の失敗 (顧客ID無効等) でアカウント削除全体を止めない。記録のみ。
        console.error("[/api/account/delete] stripe cancel error:", e);
      }
    }

    // 3. 認証ユーザーを削除 (profiles / scenarios は auth.users への on delete cascade で連動削除)
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) {
      // 「サブスクは解約済みだが auth ユーザーは残存」という中途半端な状態。
      // ユーザーに解約済みを伝えサポート対応できるよう、状態を明示してログ。
      console.error(
        "[/api/account/delete] deleteUser FAILED (stripeCanceled=%s) user=%s err=%o",
        stripeCanceled, user.id, delErr,
      );
      return NextResponse.json(
        { error: "delete_failed", subscriptionCanceled: stripeCanceled },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    // 内部情報 (Stripe/DB の生メッセージ) はクライアントに返さず、サーバログに閉じる。
    console.error("[/api/account/delete] error:", e);
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
