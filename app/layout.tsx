import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { PWARegister } from "./components/PWARegister";

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
  title: "TowerSim — 建設業の原価・交渉シミュレーター",
  description:
    "工務店・建設業の経営者・営業担当のための原価計算と単価交渉シミュレーター。総額提示案件・単価提案・社内採算判定をスマホでもPCでも。",
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
    title: "TowerSim — 建設業の原価・交渉シミュレーター",
    description:
      "原価・交渉のすべての判断を、現場でも事務所でも。建設業向け SaaS。",
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
  return (
    <html lang="ja" className={`${noto.variable} ${mincho.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
        <PWARegister />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
