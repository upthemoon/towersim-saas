import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile, canAccessApp } from "@/lib/subscription";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

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
    <div className="flex flex-col h-screen">
      <header className="bg-steel-dark text-paper border-b border-steel">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-rust text-xl leading-none">⚡</span>
            <span className="font-mincho font-bold tracking-wider">TowerSim</span>
          </Link>
          <div className="flex items-center gap-3 text-xs">
            {trialDaysLeft !== null && (
              <span className="bg-rust text-paper px-2 py-1 rounded">
                試用期間 残り {trialDaysLeft} 日
              </span>
            )}
            {profile.subscription_status === "active" && (
              <span className="bg-emerald-700 text-paper px-2 py-1 rounded">
                {profile.plan === "yearly" ? "年額" : "月額"}プラン
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
      />
    </div>
  );
}
