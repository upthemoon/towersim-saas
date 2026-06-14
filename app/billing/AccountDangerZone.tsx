"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * /billing 下部の「アカウント」区画。
 * - 解約導線の明示 (実際の解約は上の Stripe カスタマーポータルで行う)
 * - アカウント削除 (「削除」と入力する二段確認 → /api/account/delete)
 */
export function AccountDangerZone({ hasActiveSubscription }: { hasActiveSubscription: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = async () => {
    if (loading) return; // 連打による多重送信を防ぐ (disabled の再描画待ちに依存しない)
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/account/delete", { method: "POST" });
      const text = await r.text();
      let data: { ok?: boolean; error?: string; subscriptionCanceled?: boolean } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`サーバが想定外の応答を返しました (HTTP ${r.status})`);
      }
      if (!r.ok || !data.ok) {
        if (data.subscriptionCanceled) {
          // 解約は済んだが削除に失敗 → サポート導線を明示。
          throw new Error(
            "お支払いは解約されましたが、アカウント削除に失敗しました。お手数ですが support@upthemoon.co.jp までご連絡ください。",
          );
        }
        throw new Error(
          data.error === "delete_failed"
            ? "アカウント削除に失敗しました。時間をおいて再度お試しください。"
            : data.error ?? `HTTP ${r.status}`,
        );
      }
      // 成功 → クライアント側もサインアウトしてトップへ
      const sb = createSupabaseBrowserClient();
      await sb?.auth.signOut().catch(() => {
        // cookie は残るが auth ユーザーは削除済み。遷移を優先 (次アクセスで /signin に弾かれる)。
      });
      window.location.href = "/";
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  return (
    <section className="mt-10 border border-rust/40 rounded-lg p-6 bg-rust/5">
      <h2 className="font-mincho text-xl font-bold text-ink">アカウント</h2>

      {/* 解約導線の明示 */}
      <div className="mt-3 text-sm text-ink-2 leading-relaxed">
        {hasActiveSubscription ? (
          <p>
            有料プランの<strong>解約</strong>は、上の「プラン変更・解約・お支払い情報」から
            Stripe カスタマーポータルを開いて行えます。解約後も契約期間の末日まで引き続きご利用いただけます。
          </p>
        ) : (
          <p>現在、有効な有料プランはありません（試用期間中、または未契約）。</p>
        )}
      </div>

      {/* アカウント削除 */}
      <div className="mt-6 pt-6 border-t border-rust/30">
        <h3 className="font-bold text-ink">アカウントを削除</h3>
        <p className="mt-2 text-sm text-ink-2 leading-relaxed">
          アカウントと関連データ（プロフィール・契約情報）を完全に削除します。
          <strong>この操作は取り消せません。</strong>
          有効な有料プラン・試用中の契約がある場合は、削除と同時に自動で解約されます。
        </p>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="mt-4 border-2 border-rust text-rust px-5 py-2.5 rounded font-bold hover:bg-rust hover:text-paper transition"
          >
            アカウントを削除する
          </button>
        ) : (
          <div className="mt-4">
            <label htmlFor="delete-confirm" className="block text-sm text-ink-2 mb-2">
              確認のため、下の欄に <strong>削除</strong> と入力してください。
            </label>
            <input
              id="delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="削除"
              autoComplete="off"
              className="w-full max-w-xs border border-rust/50 bg-paper px-3 py-2 rounded text-sm focus:outline-none focus:border-rust"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={deleteAccount}
                disabled={confirmText !== "削除" || loading}
                className="bg-rust text-paper px-5 py-2.5 rounded font-bold hover:bg-rust-dark transition disabled:opacity-40"
              >
                {loading ? "削除中…" : "完全に削除する"}
              </button>
              <button
                onClick={() => {
                  setConfirming(false);
                  setConfirmText("");
                  setError(null);
                }}
                disabled={loading}
                className="px-5 py-2.5 rounded font-bold text-ink-2 hover:bg-paper-2 transition disabled:opacity-40"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-rust">削除に失敗しました: {error}</p>}
      </div>
    </section>
  );
}
