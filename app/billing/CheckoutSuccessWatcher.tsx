"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// /billing?checkout=success 着地後、Stripe webhook が profile に反映されるまで数十秒かかる。
// その間は手動リロードを促すしかなく、ユーザーが「処理中」のまま放置されて混乱する。
// 一定間隔で router.refresh() を呼んでサーバ側 RSC を再取得し、反映を検知したら自動で
// 表示を切り替える（手動リロード案内は出さない）。
//
// 反映シグナルは current_period_end が未来か（= 引数 active）。これは webhook のみが書く列で、
// トライアル中の課金（trial_end 同期）で subscription_status が "trialing" のまま据え置かれても
// 確実に立つため、status ラベルではなくこの値を見る。

const INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 20; // 約 60 秒で打ち切り（webhook 遅延の現実的上限）

export function CheckoutSuccessWatcher({ active }: { active: boolean }) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [rechecking, setRechecking] = useState(false);

  useEffect(() => {
    if (active || attempts >= MAX_ATTEMPTS) return;
    const id = setTimeout(() => {
      router.refresh();
      setAttempts((n) => n + 1);
    }, INTERVAL_MS);
    return () => clearTimeout(id);
  }, [active, attempts, router]);

  // タイムアウト後の手動再確認の連打抑止。一定時間でボタンを再度有効化する。
  useEffect(() => {
    if (!rechecking) return;
    const id = setTimeout(() => setRechecking(false), 2000);
    return () => clearTimeout(id);
  }, [rechecking]);

  if (active) {
    return (
      <div className="mt-6 p-4 bg-emerald-700/10 border-l-4 border-emerald-700 text-sm text-ink" aria-live="polite">
        <strong>お支払いが完了しました。</strong> ご利用ありがとうございます。
      </div>
    );
  }

  if (attempts >= MAX_ATTEMPTS) {
    return (
      <div className="mt-6 p-4 bg-paper-2/60 border-l-4 border-rule text-sm text-ink" aria-live="polite">
        <strong>決済の確定に時間がかかっています。</strong>
        <br />
        お支払い自体は受け付けています。反映まで数分かかる場合があります。
        {/* 自動ポーリングは再開せず (attempts は戻さない) 1 回だけ再取得する。反映済みなら
            上の active 分岐で成功表示に切り替わる。連打は rechecking で短時間抑止する。 */}
        <button
          type="button"
          disabled={rechecking}
          onClick={() => {
            setRechecking(true);
            router.refresh();
          }}
          className="ml-1 underline text-steel-dark disabled:opacity-50 disabled:no-underline"
        >
          {rechecking ? "確認中…" : "状態を再確認する"}
        </button>
      </div>
    );
  }

  return (
    <div
      className="mt-6 p-4 bg-emerald-700/10 border-l-4 border-emerald-700 text-sm text-ink flex items-center gap-2"
      aria-live="polite"
    >
      <span
        className="inline-block h-3 w-3 shrink-0 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin"
        aria-hidden
      />
      <span>
        <strong>お支払いを受け付けました。</strong> 決済処理を確定しています。自動で画面を更新します。
      </span>
    </div>
  );
}
