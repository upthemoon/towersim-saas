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

/** 無料トライアル日数。LP・特商法・利用規約・実装すべてこの値を単一ソースとする。 */
export const TRIAL_DAYS = 7;

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

/**
 * 表示用の実効ステータス。subscription_status は Stripe Webhook 経由でのみ更新されるため、
 * カード未登録のままトライアルを離脱したユーザーは Stripe subscription が存在せず webhook が
 * 発火しないので 'trialing' のまま固着する。canAccessApp は日付で正しくアクセスを閉じている
 * が、表示ラベルは固着値を見るとズレる（期限切れなのに「試用期間中」表示）。ここで日付から
 * 実効ステータスを導出し、表示側で使う。DB は一切書き換えない（純粋関数）。
 * 引数は ensureProfile が必ず返す non-null な ProfileRow を前提とする（呼び出し側で null は throw 済み）。
 */
export function effectiveStatus(p: ProfileRow): SubscriptionStatus {
  const now = new Date();
  if (
    p.subscription_status === "trialing" &&
    (!p.trial_ends_at || new Date(p.trial_ends_at) <= now)
  ) {
    return "expired";
  }
  if (
    p.subscription_status === "canceled" &&
    (!p.current_period_end || new Date(p.current_period_end) <= now)
  ) {
    return "expired";
  }
  return p.subscription_status;
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

  // 初回ログイン: トライアル付き profile を作成。
  // /app は親ページと埋め込み iframe(/simulator) が初回ロードでほぼ同時に ensureProfile を
  // 呼ぶため、素の insert だと競合敗者が user_id PK 重複(23505)で throw → 500 になる。
  // upsert(ON CONFLICT DO NOTHING)で競合を無害化し、確定行は再 select で取り直す。
  // DO UPDATE にすると既存の active/canceled を trialing へ巻き戻す事故があり得るため、
  // 必ず ignoreDuplicates(=DO NOTHING)。既存行は冒頭の maybeSingle が拾うので原則ここには来ない。
  const trialEndsAt = new Date(
    Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        subscription_status: "trialing",
        trial_ends_at: trialEndsAt,
      },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
  if (upsertError) throw upsertError;

  // upsert が DO NOTHING で競合した場合も既存行は存在するため select は 1 行返る。
  // maybeSingle + null チェックで「行が消えた」異常を 500 ではなく明示エラーにする。
  const { data: row, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (selectError) throw selectError;
  if (!row) throw new Error("profile not found after upsert");
  return row as ProfileRow;
}
