import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Stripe Customer Portal セッションを作成し、リダイレクト先 URL を返す。
 * プラン変更・解約・支払い方法変更・領収書ダウンロードはすべて Portal 側で完結。
 * 年額→月額 等の変更時は Stripe が自動で差額を prorate する（Portal の設定で挙動を制御）。
 */
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: "no_customer" }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: unknown) {
    const err = e as { message?: string; code?: string };
    console.error("[/api/billing-portal] error:", err);
    return NextResponse.json({ error: err.message ?? "portal_failed", code: err.code }, { status: 500 });
  }
}
