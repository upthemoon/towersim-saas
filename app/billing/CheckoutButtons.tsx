"use client";

import { useState } from "react";

export function CheckoutButtons() {
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (plan: "monthly" | "yearly") => {
    setLoading(plan); setError(null);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
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
            : "決済画面の準備に失敗しました。時間をおいて再度お試しください。",
        );
      }
      if (!data.url) throw new Error("決済画面の URL を取得できませんでした");
      window.location.href = data.url;
    } catch (e) {
      setError((e as Error).message);
      setLoading(null);
    }
  };

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6">
        <PlanCard
          title="月額プラン" price="¥3,000" unit="/月"
          ctaLabel="月額で続ける"
          onClick={() => startCheckout("monthly")}
          loading={loading === "monthly"}
          disabled={loading !== null}
        />
        <PlanCard
          title="年額プラン" price="¥30,000" unit="/年"
          badge="17% お得 (月換算 ¥2,500)"
          ctaLabel="年額で続ける"
          onClick={() => startCheckout("yearly")}
          loading={loading === "yearly"}
          disabled={loading !== null}
          highlighted
        />
      </div>
      {error && <p className="mt-4 text-sm text-rust">{error}</p>}
    </div>
  );
}

function PlanCard(props: {
  title: string; price: string; unit: string; ctaLabel: string;
  badge?: string; highlighted?: boolean; loading: boolean; disabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className={`relative bg-paper rounded-lg p-8 border-2 ${props.highlighted ? "border-rust shadow-xl" : "border-rule"}`}>
      {props.badge && (
        <span className="absolute -top-3 right-6 bg-rust text-paper text-xs font-bold px-3 py-1 rounded">
          {props.badge}
        </span>
      )}
      <h3 className="font-mincho text-xl font-bold text-ink">{props.title}</h3>
      <div className="mt-4 flex items-baseline">
        <span className="text-4xl font-bold text-steel-dark">{props.price}</span>
        <span className="ml-1 text-ink-2">{props.unit}</span>
      </div>
      <button
        onClick={props.onClick} disabled={props.disabled}
        className={`block w-full text-center mt-8 px-5 py-3 rounded font-bold transition disabled:opacity-50 ${
          props.highlighted ? "bg-rust text-paper hover:bg-rust-dark" : "border-2 border-steel-dark text-steel-dark hover:bg-steel-dark hover:text-paper"
        }`}
      >
        {props.loading ? "決済画面を準備中…" : props.ctaLabel}
      </button>
    </div>
  );
}
