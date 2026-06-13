import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { PWARegister } from "./components/PWARegister";

declare global {
  interface Window {
    // gtag は下記 beforeInteractive スニペットで定義。SigninForm のコンバージョン送信が参照する。
    gtag?: (...args: unknown[]) => void;
  }
}

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto",
});

const mincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-mincho",
});

export const metadata: Metadata = {
  title: "TowerSim — 建設業・運送業など労務原価ベースの業種向け 原価・交渉シミュレーター",
  description:
    "建設業・運送業など労務原価が中心の業種の経営者・営業担当のための原価計算と単価交渉シミュレーター。総額提示案件・単価交渉・受注可否判断をスマホでもPCでも。",
  metadataBase: new URL("https://towersim.upthemoon.co.jp"),
  applicationName: "TowerSim",
  appleWebApp: {
    capable: true,
    title: "TowerSim",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "TowerSim — 建設業・運送業など労務原価ベースの業種向け 原価・交渉シミュレーター",
    description:
      "原価・交渉のすべての判断を、現場でも事務所でも。建設業・運送業など労務原価ベースの業種向け SaaS。",
    url: "https://towersim.upthemoon.co.jp",
    siteName: "TowerSim",
    locale: "ja_JP",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4EDDC" },
    { media: "(prefers-color-scheme: dark)", color: "#1A2B4A" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const adsId = process.env.NEXT_PUBLIC_GADS_ID;
  return (
    <html lang="ja" className={`${noto.variable} ${mincho.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
        <PWARegister />
        <Analytics />
        <SpeedInsights />
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {/* Google 広告 (gtag.js)。Google 推奨の標準スニペットを実体 <script> として SSR 出力し、
            タグ検出クローラ / Tag Assistant が静的にも検出できるようにする (next/script の
            afterInteractive/beforeInteractive は SSR HTML に preload しか出さず検出されなかった)。
            adsId は AW- 形式の env 値でユーザー入力ではない。
            将来 GA4 (gaId) を併用する際は window.gtag の競合がないか動作確認すること。 */}
        {adsId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;gtag('js',new Date());gtag('config','${adsId}');`,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
