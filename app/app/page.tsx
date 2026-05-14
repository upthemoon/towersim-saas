import type { Viewport } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile, canAccessApp } from "@/lib/subscription";
import { SignOutButton } from "./SignOutButton";
import { TowerIcon } from "../components/TowerIcon";

export const dynamic = "force-dynamic";

// /app は simulator (紺青基調) を全面表示するページなので iOS Safari の
// 上下ツールバー色 (theme-color) も紺青に揃えてシームレスに見せる。
// LP / signin / billing は親 layout の古紙色 (#F4EDDC) のまま。
export const viewport: Viewport = {
  themeColor: "#1A2B4A",
};

export default async function AppPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const profile = await ensureProfile(supabase, user.id);
  if (!canAccessApp(profile)) redirect("/billing?reason=expired");

  const trialDaysLeft = profile.subscription_status === "trialing" && profile.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div
      className="flex flex-col bg-steel-dark"
      style={{
        height: "100dvh",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        overscrollBehavior: "none",
      }}
    >
      {/* アカウント操作だけの細い帯。アプリ名・キャッチコピーは iframe 内 simulator.html 側で表示。
          simulator.html の `.header-inner` が `padding: 0 22px` で左端に寄せているのでこちらも同じ余白に合わせる。 */}
      <header className="bg-steel-dark text-paper border-b border-steel">
        <div className="h-9 flex items-center justify-between gap-3 text-xs" style={{ paddingLeft: 22, paddingRight: 22 }}>
          <Link href="/" className="flex items-center gap-1.5 text-paper-2 hover:text-paper">
            <TowerIcon size={16} className="text-paper" />
            <span className="font-mincho tracking-wider">TowerSim</span>
          </Link>
          <div className="flex items-center gap-3">
            {trialDaysLeft !== null && (
              <span className="bg-rust text-paper px-2 py-0.5 rounded">
                試用 残り {trialDaysLeft} 日
              </span>
            )}
            {profile.subscription_status === "active" && (
              <span className="bg-emerald-700 text-paper px-2 py-0.5 rounded">
                {profile.plan === "yearly" ? "年額" : "月額"}
              </span>
            )}
            <Link href="/billing" className="text-paper-2 hover:text-paper underline">
              請求
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <iframe
        src="/simulator.html"
        className="flex-1 w-full border-0"
        title="TowerSim Simulator"
        style={{ overscrollBehavior: "none" }}
      />
    </div>
  );
}
