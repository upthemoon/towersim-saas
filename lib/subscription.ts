import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionStatus =
  | "trialing"        // 7日無料試用中
  | "active"          // 有料サブスク稼働中
  | "past_due"        // 課金失敗・グレース期間
  | "canceled"        // ユーザーがキャンセル済み（期間内は active 相当）
  | "expired"         // 試用期間切れ・課金なし
  | "none";           // 一度も試用していない（新規）

export interface ProfileRow {
  user_id: string;
  stripe_customer_id: string | null;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;        // ISO timestamp
  current_period_end: string | null;   // ISO timestamp
  plan: "monthly" | "yearly" | null;
}

/** ユーザーが /app にアクセス可能かを判定する。 */
export function canAccessApp(p: ProfileRow | null): boolean {
  if (!p) return false;
  if (p.subscription_status === "active") return true;
  if (p.subscription_status === "trialing") {
    return !!p.trial_ends_at && new Date(p.trial_ends_at) > new Date();
  }
  if (p.subscription_status === "canceled") {
    // キャンセル済みでも契約期間の末日まで利用可 (current_period_end は item から取得済)。
    return !!p.current_period_end && new Date(p.current_period_end) > new Date();
  }
  if (p.subscription_status === "past_due") {
    // 課金リトライ (dunning) 中は猶予してアクセスを維持する (支払い意思のある既存客を
    // カード一時不通で即ロックしないため)。Stripe の billing_mode (legacy/flexible) に依らず
    // 安全な挙動。dunning が尽きると Stripe が canceled/unpaid へ落とし (mapStripeStatus で
    // canceled)、上の分岐で期間末ロックされるため、猶予は無期限ではない。
    return true;
  }
  return false;
}

/** 認証済みユーザーの profile 行を取得（無ければ作成）。 */
export async function ensureProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRow> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing as ProfileRow;

  // 初回ログイン: 7日トライアル付き profile を作成
  const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: created, error } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      subscription_status: "trialing",
      trial_ends_at: trialEndsAt,
    })
    .select("*")
    .single();

  if (error) throw error;
  return created as ProfileRow;
}
