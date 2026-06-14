"use client";

import { useState } from "react";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch("/api/billing-portal", { method: "POST" });
      const text = await r.text();
      let data: { url?: string; error?: string } = {};
      try { data = text ? JSON.parse(text) : {}; }
      catch {
        throw new Error("サーバが想定外の応答を返しました。時間をおいて再度お試しください。");
      }
      if (!r.ok) {
        throw new Error(
          r.status === 401
            ? "セッションの有効期限が切れました。お手数ですが再度ログインしてください。"
            : "ポータルの準備に失敗しました。時間をおいて再度お試しください。",
        );
      }
      if (!data.url) throw new Error("ポータル URL を取得できませんでした");
      window.location.href = data.url;
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={openPortal}
        disabled={loading}
        className="bg-steel-dark text-paper px-6 py-3 rounded font-bold hover:bg-steel transition disabled:opacity-50"
      >
        {loading ? "ポータルを準備中…" : "Stripe カスタマーポータルを開く"}
      </button>
      {error && <p className="mt-3 text-sm text-rust">{error}</p>}
    </div>
  );
}
