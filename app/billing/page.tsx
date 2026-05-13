import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/subscription";
import { CheckoutButtons } from "./CheckoutButtons";
import { TowerIcon } from "../components/TowerIcon";

export const dynamic = "force-dynamic";

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ reason?: string; checkout?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin?redirect=/billing");

  const profile = await ensureProfile(supabase, user.id);
  const params = await searchParams;
  const expired = params.reason === "expired";

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

        <p className="mt-4 text-sm text-ink-2">
          現在のステータス:{" "}
          <span className="font-bold">{statusLabel(profile.subscription_status)}</span>
          {profile.trial_ends_at && profile.subscription_status === "trialing" && (
            <span className="ml-2 text-ink-2">
              （{new Date(profile.trial_ends_at).toLocaleDateString("ja-JP")} まで無料試用）
            </span>
          )}
          {profile.current_period_end && (profile.subscription_status === "active" || profile.subscription_status === "canceled") && (
            <span className="ml-2 text-ink-2">
              （次回更新: {new Date(profile.current_period_end).toLocaleDateString("ja-JP")}）
            </span>
          )}
        </p>

        <div className="mt-10">
          <CheckoutButtons />
        </div>

        <p className="mt-8 text-xs text-ink-2">
          ※ Stripe Checkout に遷移します。お支払い情報の登録・更新・解約はすべて Stripe の安全な画面で行えます。
        </p>
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
