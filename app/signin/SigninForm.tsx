"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { sendGAEvent } from "@next/third-parties/google";
import { TRIAL_DAYS } from "@/lib/subscription";

/**
 * Open redirect 対策: 同一オリジン内 path のみ許可 (OWASP CWE-601)
 * 2026-05-27 security-auditor 指摘
 */
function sanitizeRedirect(raw: string | null): string {
  const fallback = "/app";
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.startsWith("/\\")) return fallback;
  return raw;
}

/**
 * Supabase Auth (GoTrue) が返す英語のエラーメッセージを日本語に変換する。
 * 弱いパスワードは複数理由 (文字数 / 文字種 / 漏洩) が 1 文に連結されて返ることがあるので、
 * 検出した条件を合成して 1 つの日本語文にする。未知のメッセージは原文をそのまま返し、握りつぶさない。
 */
function translateAuthError(error: { message?: string; code?: string }): string {
  const msg = error.message ?? "";
  const code = error.code ?? "";

  // --- 弱いパスワード (weak_password): 理由を合成 ---
  const weakReasons: string[] = [];
  const lenMatch = msg.match(/at least (\d+) characters?/i);
  if (lenMatch) weakReasons.push(`${lenMatch[1]}文字以上にする`);
  if (/character of each|lower.?case|upper.?case|abcdefghijklmnopqrstuvwxyz/i.test(msg)) {
    weakReasons.push("英小文字・英大文字・数字をそれぞれ1文字以上含める");
  }
  if (/known to be weak|easy to guess|compromised|pwned|breach/i.test(msg)) {
    weakReasons.push("漏洩・推測されやすいパスワードを避ける");
  }
  if (weakReasons.length > 0) {
    return `次の条件を満たすパスワードを設定してください：${weakReasons.join("、")}。`;
  }
  if (code === "weak_password") {
    return "パスワードが安全性の要件を満たしていません。英小文字・英大文字・数字を含む8文字以上で、推測されにくいものを設定してください。";
  }

  // --- その他のよくある認証エラー ---
  if (code === "user_already_exists" || /already registered|already been registered/i.test(msg)) {
    return "このメールアドレスは既に登録されています。ログインしてください。";
  }
  if (code === "invalid_credentials" || /Invalid login credentials/i.test(msg)) {
    return "メールアドレスまたはパスワードが正しくありません。";
  }
  if (code === "email_not_confirmed" || /Email not confirmed/i.test(msg)) {
    return "メールアドレスの確認が完了していません。確認メールのリンクをクリックしてください。";
  }
  if (code === "email_address_invalid" || /Unable to validate email address|invalid format/i.test(msg)) {
    return "メールアドレスの形式が正しくありません。";
  }
  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    /rate limit|too many requests|after \d+ seconds/i.test(msg)
  ) {
    return "リクエストが集中しています。しばらく時間をおいてから再度お試しください。";
  }

  // 既定: 未知のエラーは原文を残す (英語のまま握りつぶさない)
  return msg || "エラーが発生しました。時間をおいて再度お試しください。";
}

export function SigninForm() {
  const params = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";
  const redirectPath = sanitizeRedirect(params.get("redirect"));

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // /auth/callback がコード交換に失敗すると ?error=auth_callback で戻すので、初期表示で案内する。
  const [error, setError] = useState<string | null>(
    params.get("error") === "auth_callback"
      ? "ログインの確認に失敗しました。お手数ですが、もう一度ログインしてください。"
      : null,
  );
  const [info, setInfo] = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();
  const setupIncomplete = supabase === null;
  // OAuth (Google/Apple) は当面停止し、メール登録/ログインのみ提供。
  // 再開時: Vercel env に NEXT_PUBLIC_OAUTH_ENABLED=true を設定 + Supabase で各プロバイダを有効化。
  const oauthEnabled = process.env.NEXT_PUBLIC_OAUTH_ENABLED === "true";

  const oauthLogin = async (provider: "google" | "apple") => {
    if (!supabase) { setError("セットアップ未完了 (Supabase env が未設定)"); return; }
    setError(null); setInfo(null); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`,
        },
      });
      if (error) setError(translateAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) { setError("セットアップ未完了 (Supabase env が未設定)"); return; }
    setError(null); setInfo(null); setLoading(true);
    let navigating = false;
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}` },
        });
        if (error) { setError(translateAuthError(error)); return; }
        // GA4 コンバージョン: 新規登録フォーム送信完了時点を CV とする (メール確認前・広告効果測定の最小実装)。
        // 注1: OAuth(Google/Apple)経由の登録はこの計測対象外 (oauthLogin には未設置)。
        // 注2: GA 未初期化時 (NEXT_PUBLIC_GA_ID 未設定) は sendGAEvent が console.warn を出してスキップ (実害なし)。
        sendGAEvent("event", "sign_up", { method: "email" });
        // Google 広告 コンバージョン: 同じ sign_up を広告側でも計測する。
        // send_to = `${NEXT_PUBLIC_GADS_ID}/${NEXT_PUBLIC_GADS_SIGNUP_LABEL}`。
        // ラベルは広告 → ツール → コンバージョン でアクション作成後に取得し env に設定。
        // 未設定時 or gtag 未ロード時はスキップ (実害なし)。
        const adsId = process.env.NEXT_PUBLIC_GADS_ID;
        const cvLabel = process.env.NEXT_PUBLIC_GADS_SIGNUP_LABEL;
        if (adsId && cvLabel && typeof window !== "undefined" && typeof window.gtag === "function") {
          window.gtag("event", "conversion", { send_to: `${adsId}/${cvLabel}` });
        }
        setInfo("確認メールを送信しました。メール内のリンクをクリックしてサインインを完了してください。");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError(translateAuthError(error)); return; }
        // ログイン直後は router.push + refresh のクライアント側 RSC 遷移だと、新しい認証クッキーが
        // サーバへ伝播し切る前に保護ページ(/app)の RSC フェッチが走り、
        // 「A server error occurred / Reload して」表示になることがある(手動リロード=フルロードだと直る)。
        // 毎回フルロード遷移にして、サーバが確実に新セッションで描画するようにする。
        navigating = true;
        window.location.assign(redirectPath);
        return;
      }
    } finally {
      // フルロード遷移中はボタンを「処理中…」のまま固定し、二度押しを防ぐ。
      if (!navigating) setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-mincho text-2xl font-bold text-ink mb-2 text-center">
        {mode === "signup" ? "アカウント作成" : "ログイン"}
      </h1>
      <p className="text-sm text-ink-2 text-center mb-6">
        {mode === "signup" ? `${TRIAL_DAYS}日間無料でお試しいただけます` : "TowerSim にログインします"}
      </p>

      {setupIncomplete && (
        <div className="mb-4 p-3 bg-rust/10 border-l-4 border-rust text-xs">
          ⚠️ デプロイ前のプレビューです。<br />
          実際のサインインには Supabase 環境変数の設定が必要です。
        </div>
      )}

      {oauthEnabled && (
        <>
          <div className="space-y-3">
            <button
              onClick={() => oauthLogin("google")}
              disabled={loading}
              className="w-full border-2 border-rule bg-paper py-3 px-4 rounded font-bold hover:bg-paper-2 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>🔵</span> Google で {mode === "signup" ? "登録" : "ログイン"}
            </button>
            <button
              onClick={() => oauthLogin("apple")}
              disabled={loading}
              className="w-full bg-ink text-paper py-3 px-4 rounded font-bold hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
               Apple で {mode === "signup" ? "登録" : "ログイン"}
            </button>
          </div>

          <div className="flex items-center gap-3 my-6 text-xs text-ink-2">
            <div className="flex-1 h-px bg-rule" />
            <span>または メール</span>
            <div className="flex-1 h-px bg-rule" />
          </div>
        </>
      )}

      <form onSubmit={handleEmail} className="space-y-3" method="post" action="#">
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          name="email" id="email" autoComplete="email" inputMode="email" autoCapitalize="off" autoCorrect="off" spellCheck={false}
          className="w-full border border-rule bg-paper px-4 py-3 rounded text-sm focus:outline-none focus:border-steel-dark"
        />
        <input
          type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード（8文字以上）"
          name="password" id="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="w-full border border-rule bg-paper px-4 py-3 rounded text-sm focus:outline-none focus:border-steel-dark"
        />
        {error && <p className="text-sm text-rust">{error}</p>}
        {info && <p className="text-sm text-emerald-700">{info}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full bg-rust text-paper py-3 rounded font-bold hover:bg-rust-dark transition disabled:opacity-50"
        >
          {loading ? "処理中…" : mode === "signup" ? "登録する" : "ログイン"}
        </button>
      </form>

      <p className="text-center text-xs text-ink-2 mt-4">
        一度ログインすると、次回からはログイン状態が保持されます（毎回入力する必要はありません）。
      </p>

      <p className="text-center text-sm text-ink-2 mt-6">
        {mode === "signup" ? (
          <>
            既にアカウントをお持ち？{" "}
            <button onClick={() => setMode("signin")} className="underline text-steel-dark">
              ログイン
            </button>
          </>
        ) : (
          <>
            アカウント未作成？{" "}
            <button onClick={() => setMode("signup")} className="underline text-steel-dark">
              新規登録
            </button>
          </>
        )}
      </p>
    </div>
  );
}
