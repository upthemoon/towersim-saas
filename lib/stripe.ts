import Stripe from "stripe";

// セットアップ前 (env 未設定) でもビルド・LP プレビューを通すため、空文字で初期化。
// API ルートが実行されるときに env がなければそこで例外が出る。
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-04-22.dahlia",
});

export const STRIPE_PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY!;
export const STRIPE_PRICE_YEARLY = process.env.STRIPE_PRICE_YEARLY!;

/** Stripe の subscription.status をアプリ内ステータスへマップ */
export function mapStripeStatus(s: string): "active" | "trialing" | "past_due" | "canceled" | "expired" {
  switch (s) {
    case "trialing": return "trialing";
    case "active": return "active";
    case "past_due": return "past_due";
    case "canceled":
    case "unpaid": return "canceled";
    case "incomplete":
    case "incomplete_expired":
    default: return "expired";
  }
}
