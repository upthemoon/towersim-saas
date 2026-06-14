import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * 同一オリジン内の安全な path のみ許可する open redirect 対策。
 * - `/` 始まり必須
 * - `//` 始まりは外部 URL 扱いで拒否 (例: `//evil.com`)
 * - 不正値は `/app` にフォールバック
 * 参考: OWASP CWE-601 (2026-05-27 security-auditor 指摘)
 */
function sanitizeRedirect(raw: string | null): string {
  const fallback = "/app";
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.startsWith("/\\")) return fallback; // backslash variant
  return raw;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = sanitizeRedirect(searchParams.get("redirect"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // 交換失敗 (code 失効・メールクライアントのプリフェッチ等による二重消費・verifier 欠落) を
      // 無視して /app へ飛ばすと、未ログインのまま保護ページに着地してエラー/ループになる。
      // signin にエラー付きで戻し、再ログインを促す。
      const signin = new URL("/signin", origin);
      signin.searchParams.set("redirect", redirect);
      signin.searchParams.set("error", "auth_callback");
      return NextResponse.redirect(signin);
    }
  }
  return NextResponse.redirect(`${origin}${redirect}`);
}
