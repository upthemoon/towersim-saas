"use client";

import Script from "next/script";

declare global {
  interface Window {
    // @next/third-parties は window.dataLayer のみグローバル宣言し window.gtag は宣言しない。
    // よって dataLayer は再宣言せず (型衝突回避)、gtag のみここで補完する。
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google 広告 (gtag.js) タグ。AW- 形式のコンバージョン ID を読み込む。
 * GA4 (G-) とは別系統で、Google 広告のコンバージョン計測専用。
 * layout 側で NEXT_PUBLIC_GADS_ID が設定されている時のみ描画される。
 * sign_up コンバージョンの送信は SigninForm.tsx 側で
 * window.gtag('event', 'conversion', ...) を発火する。
 */
export function GoogleAds({ adsId }: { adsId: string }) {
  return (
    <>
      <Script
        id="gtag-ads-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
      />
      <Script id="gtag-ads-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('js', new Date());
gtag('config', '${adsId}');`}
      </Script>
    </>
  );
}
