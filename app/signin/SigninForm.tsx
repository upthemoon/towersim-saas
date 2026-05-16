"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SigninForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";
  const redirectPath = params.get("redirect") ?? "/app";

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();
  const setupIncomplete = supabase === null;

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
      if (error) setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) { setError("セットアップ未完了 (Supabase env が未設定)"); return; }
    setError(null); setInfo(null); setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}` },
        });
        if (error) { setError(error.message); return; }
        setInfo("確認メールを送信しました。メール内のリンクをクリックしてサインインを完了してください。");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError(error.message); return; }
        router.push(redirectPath);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-mincho text-2xl font-bold text-ink mb-2 text-center">
        {mode === "signup" ? "アカウント作成" : "ログイン"}
      </h1>
      <p className="text-sm text-ink-2 text-center mb-6">
        {mode === "signup" ? "7日間無料でお試しいただけます" : "TowerSim にログインします"}
      </p>

      {setupIncomplete && (
        <div className="mb-4 p-3 bg-rust/10 border-l-4 border-rust text-xs">
          ⚠️ デプロイ前のプレビューです。<br />
          実際のサインインには Supabase 環境変数の設定が必要です。
        </div>
      )}

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
