import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/subscription";
import { CheckoutButtons } from "./CheckoutButtons";
import { ManageBillingButton } from "./ManageBillingButton";
import { AccountDangerZone } from "./AccountDangerZone";
import { TowerIcon } from "../components/TowerIcon";

export const dynamic = "force-dynamic";

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ reason?: string; checkout?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin?redirect=/billing");

  const profile = await ensureProfile(supabase, user.id);
  const params = await searchParams;
  const expired = params.reason === "expired";
  const justCheckedOut = params.checkout === "success";
  const checkoutCanceled = params.checkout === "canceled";

  // 既に有料プラン契約中 → Stripe Customer Portal でプラン変更/解約。Checkout は隠す。
  // past_due (カード期限切れ・課金失敗) もポータル経由でカード更新できる導線を出す
  const hasActiveSubscription =
    (profile.subscription_status === "active"
      || profile.subscription_status === "canceled"
      || profile.subscription_status === "past_due")
    && !!profile.stripe_customer_id;

  return (
    <div className="min-h-screen bg-paper bg-blueprint">
      <header className="border-b border-rule bg-paper/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <TowerIcon size={28} className="text-steel-dark" />
            <span className="font-mincho text-lg font-bold tracking-wider text-ink">TowerSim</span>
          </Link>
          <Link href="/app" className="text-sm text-steel-dark underline">アプリへ戻る</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-mincho text-3xl font-bold text-ink">プラン選択</h1>

        {expired && (
          <div className="mt-6 p-4 bg-rust/10 border-l-4 border-rust text-sm">
            無料試用期間が終了しました。続けてご利用いただくにはプランを選択してください。
          </div>
        )}

        {justCheckedOut && (
          <div className="mt-6 p-4 bg-emerald-700/10 border-l-4 border-emerald-700 text-sm text-ink">
            <strong>お支払いを受け付けました。</strong><br />
            決済処理を確定中です。数秒後にステータスが反映されます。
            このページをリロードしてご確認ください。
          </div>
        )}

        {checkoutCanceled && (
          <div className="mt-6 p-4 bg-ink-2/10 border-l-4 border-ink-2 text-sm text-ink-2">
            お支払いはキャンセルされました。引き続き無料試用期間をご利用いただけます。
          </div>
        )}

        {/* 現在のステータス */}
        <div className="mt-6 p-5 bg-paper-2/60 border border-rule rounded-lg">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-sm text-ink-2">現在のステータス:</span>
            <span className="font-bold text-ink">{statusLabel(profile.subscription_status)}</span>
            {profile.subscription_status === "active" && profile.plan && (
              <span className="bg-emerald-700 text-paper text-xs font-bold px-2 py-0.5 rounded">
                {profile.plan === "yearly" ? "年額プラン" : "月額プラン"}
              </span>
            )}
            {profile.subscription_status === "canceled" && profile.plan && (
              <span className="bg-ink-2 text-paper text-xs font-bold px-2 py-0.5 rounded">
                {profile.plan === "yearly" ? "年額プラン（解約済）" : "月額プラン（解約済）"}
              </span>
            )}
          </div>
          {profile.trial_ends_at && profile.subscription_status === "trialing" && (
            <p className="mt-2 text-sm text-ink-2">
              無料試用期間: {new Date(profile.trial_ends_at).toLocaleDateString("ja-JP")} まで
            </p>
          )}
          {profile.current_period_end && (profile.subscription_status === "active" || profile.subscription_status === "canceled") && (
            <p className="mt-2 text-sm text-ink-2">
              {profile.subscription_status === "canceled"
                ? `${new Date(profile.current_period_end).toLocaleDateString("ja-JP")} まで利用可能`
                : `次回更新: ${new Date(profile.current_period_end).toLocaleDateString("ja-JP")}`}
            </p>
          )}
        </div>

        {/* 契約中: Portal でプラン変更・解約 */}
        {hasActiveSubscription ? (
          <section className="mt-10 bg-paper border border-rule rounded-lg p-6">
            <h2 className="font-mincho text-xl font-bold text-ink">
              プラン変更・解約・お支払い情報
            </h2>
            <p className="mt-3 text-sm text-ink-2 leading-relaxed">
              プランの変更（月額 ⇄ 年額）・解約・クレジットカードの変更・領収書のダウンロードは
              Stripe のカスタマーポータルから行えます。
            </p>
            <p className="mt-2 text-xs text-ink-2 leading-relaxed">
              ※ 年額プランから月額プランへ切り替えた場合、Stripe が未消化期間を自動で日割り計算し、
              次回請求から相殺します。差額分の課金や返金は Stripe が自動処理します。
            </p>
            <div className="mt-6">
              <ManageBillingButton />
            </div>
          </section>
        ) : (
          /* 未契約 or トライアル中: 通常の Checkout */
          <>
            <div className="mt-10">
              <CheckoutButtons />
            </div>
            <p className="mt-8 text-xs text-ink-2">
              ※ Stripe Checkout に遷移します。お支払い情報の登録・更新・解約はすべて Stripe の安全な画面で行えます。
            </p>
          </>
        )}

        <AccountDangerZone hasActiveSubscription={hasActiveSubscription} />
      </main>
    </div>
  );
}

function statusLabel(s: string): string {
  switch (s) {
    case "trialing": return "🌱 試用期間中";
    case "active": return "✅ 有効";
    case "past_due": return "⚠️ 支払い遅延";
    case "canceled": return "🗓️ 解約済（期間内利用可）";
    case "expired": return "🚫 期限切れ";
    default: return "未登録";
  }
}
