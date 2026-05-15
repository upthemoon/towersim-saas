import Link from "next/link";
import { TowerIcon } from "./components/TowerIcon";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Problem />
      <Features />
      <Pricing />
      <FinalCTA />
      <Footer />
    </>
  );
}

function Header() {
  return (
    <header className="border-b border-rule bg-paper/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <TowerIcon size={28} className="text-steel-dark" />
          <span className="font-mincho text-lg font-bold tracking-wider text-ink">
            TowerSim
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/guide" className="text-ink-2 hover:text-ink hidden sm:inline">
            使い方
          </Link>
          <Link href="/signin" className="text-ink-2 hover:text-ink">
            ログイン
          </Link>
          <Link
            href="/signin?mode=signup"
            className="bg-steel text-paper px-4 py-2 rounded font-bold hover:bg-steel-dark transition"
          >
            無料で始める
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-paper bg-blueprint border-b border-rule">
      <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-[1.4fr_1fr] gap-12 items-center">
        <div>
          <span className="stamp text-xs">建設業向け SaaS</span>
          <h1 className="font-mincho text-4xl md:text-5xl font-bold mt-6 leading-tight text-ink">
            原価と交渉、<br />
            <span className="text-rust">紙の感覚</span>でデジタルに。
          </h1>
          <p className="mt-6 text-lg text-ink-2 leading-relaxed">
            総額提示案件・単価提案（交渉用）・社内採算判定を 1 つのシミュレーターで。<br />
            現場でスマホ、事務所で PC。同じ画面・同じ計算式で、感覚を揃える。
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/signin?mode=signup"
              className="bg-rust text-paper px-6 py-3 rounded font-bold hover:bg-rust-dark transition"
            >
              7日間 無料で試す
            </Link>
            <Link
              href="#pricing"
              className="border-2 border-ink text-ink px-6 py-3 rounded font-bold hover:bg-ink hover:text-paper transition"
            >
              料金を見る
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-2">
            ※ 試用期間中はクレジットカード登録不要です。
          </p>
        </div>

        <div className="bg-paper-2 border-2 border-steel-dark rounded shadow-xl p-6">
          <div className="text-xs text-steel-dark font-bold tracking-widest mb-2">
            計 算 例
          </div>
          <div className="font-mincho text-sm text-ink-2 mb-4">
            総額 ¥2,400,000 / 人工 60 名工
          </div>
          <dl className="space-y-2 text-sm">
            <Row label="参考1人工単価（要望）" value="¥35,000" />
            <Row label="諸経費合計" value="¥640,000" />
            <Row label="目標利益額" value="¥360,000" tone="ok" />
            <div className="border-t border-rule my-3" />
            <Row label="実質1人工単価" value="¥23,300" tone="warn" big />
            <Row label="参考単価との差額" value="−¥11,700 / 名工" tone="bad" />
          </dl>
          <div className="mt-4 p-3 bg-paper text-xs leading-relaxed border-l-2 border-rust">
            参考単価より<strong>¥11,700/人工</strong>低い。
            利益を確保するには見積を増額する or 人工を減らす交渉が必要。
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, tone, big }: { label: string; value: string; tone?: "ok" | "warn" | "bad"; big?: boolean }) {
  const colorMap = { ok: "text-emerald-700", warn: "text-amber-700", bad: "text-rust" };
  const valueClass = `${tone ? colorMap[tone] : "text-ink"} ${big ? "text-xl font-bold" : "font-semibold"}`;
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-2">{label}</dt>
      <dd className={valueClass}>{value}</dd>
    </div>
  );
}

function Problem() {
  const items = [
    { title: "Excel と電卓の往復", body: "案件ごとに別シート・別フォーマット。交渉中に数字を出すまで時間がかかる。" },
    { title: "営業の感覚と経理の数字がズレる", body: "現場で「これで取れる」と言った金額が、実は赤字だった。" },
    { title: "若手に判断基準が伝わらない", body: "ベテランの暗算は弟子に継げない。" },
  ];
  return (
    <section className="bg-paper-2 border-b border-rule">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="font-mincho text-sm text-rust tracking-widest">— 現 場 の 声 —</p>
        <h2 className="font-mincho text-3xl font-bold mt-2 mb-10 text-ink">
          見積と原価の「ズレ」、まだ感覚で吸収してませんか？
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((it) => (
            <div key={it.title} className="bg-paper p-6 border-l-4 border-steel-dark">
              <div className="text-2xl text-steel-dark mb-2">❝</div>
              <h3 className="font-bold mb-2 text-ink">{it.title}</h3>
              <p className="text-sm text-ink-2 leading-relaxed">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: "📊", title: "総額提示案件モード", body: "発注総額・人工数・諸経費を入れるだけで、実質1人工単価が即時計算。社内採算の判定も自動。" },
    { icon: "🤝", title: "単価提案（交渉用）モード", body: "要望単価と諸経費から、利益を確保したい場合の総額が逆算される。交渉メモも自動生成。" },
    { icon: "🏗️", title: "工種・工法のカスタマイズ", body: "送電線鉄塔工事を起源としつつ、どんな工事にも適用可能。工種・工法倍率を自由に編集。" },
    { icon: "📥", title: "PDF / JSON 出力", body: "計算結果をPDF化して提案資料に添付。JSON出力で案件データを保存・復元可能。" },
    { icon: "📱", title: "PC / スマホ両対応", body: "事務所のPCでも、現場のスマホでも、同じ計算式が動く。インストール不要のPWA。" },
    { icon: "🔒", title: "案件データのクラウド保存（v2予定）", body: "案件ごとのシナリオをクラウドに保存して、チーム内で共有・再利用可能（次バージョンで搭載予定）。" },
  ];
  return (
    <section id="features" className="bg-paper">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <p className="font-mincho text-sm text-rust tracking-widest">— 機 能 一 覧 —</p>
        <h2 className="font-mincho text-3xl font-bold mt-2 mb-10 text-ink">
          現場と事務所、両方の判断を支える機能。
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="border border-rule rounded p-6 bg-paper-2/30">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold mb-2 text-ink">{f.title}</h3>
              <p className="text-sm text-ink-2 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-paper-2 border-y border-rule">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <p className="font-mincho text-sm text-rust tracking-widest text-center">— 料 金 プ ラ ン —</p>
        <h2 className="font-mincho text-3xl font-bold mt-2 mb-10 text-ink text-center">
          シンプルな1プランから。
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <PricingCard
            title="月額プラン"
            price="¥3,000"
            unit="/月"
            features={["全機能利用可能", "PDF/JSON 出力無制限", "メールサポート"]}
            ctaLabel="月額で始める"
          />
          <PricingCard
            title="年額プラン"
            price="¥30,000"
            unit="/年"
            badge="17% お得"
            features={["全機能利用可能", "PDF/JSON 出力無制限", "メールサポート", "月換算 ¥2,500"]}
            ctaLabel="年額で始める"
            highlighted
          />
        </div>
        <p className="text-center text-sm text-ink-2 mt-6">
          すべてのプランで <strong className="text-rust">7日間の無料試用</strong> がついています。
          試用期間中はクレジットカード登録不要。
        </p>
      </div>
    </section>
  );
}

function PricingCard({
  title, price, unit, features, ctaLabel, badge, highlighted,
}: {
  title: string; price: string; unit: string; features: string[]; ctaLabel: string;
  badge?: string; highlighted?: boolean;
}) {
  return (
    <div className={`relative bg-paper rounded-lg p-8 border-2 ${highlighted ? "border-rust shadow-xl" : "border-rule"}`}>
      {badge && (
        <span className="absolute -top-3 right-6 bg-rust text-paper text-xs font-bold px-3 py-1 rounded">
          {badge}
        </span>
      )}
      <h3 className="font-mincho text-xl font-bold text-ink">{title}</h3>
      <div className="mt-4 flex items-baseline">
        <span className="text-4xl font-bold text-steel-dark">{price}</span>
        <span className="ml-1 text-ink-2">{unit}</span>
      </div>
      <ul className="mt-6 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start">
            <span className="text-rust mr-2">✓</span>
            <span className="text-ink-2">{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/signin?mode=signup"
        className={`block text-center mt-8 px-5 py-3 rounded font-bold transition ${
          highlighted ? "bg-rust text-paper hover:bg-rust-dark" : "border-2 border-steel-dark text-steel-dark hover:bg-steel-dark hover:text-paper"
        }`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

function FinalCTA() {
  return (
    <section className="bg-steel-dark text-paper bg-blueprint">
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="font-mincho text-3xl md:text-4xl font-bold leading-tight">
          まずは触ってみてください。
        </h2>
        <p className="mt-4 text-paper-2/80">
          数字を入れて、計算結果を見て、判断の感覚を共有できる SaaS。
        </p>
        <Link
          href="/signin?mode=signup"
          className="inline-block mt-8 bg-rust text-paper px-8 py-4 rounded font-bold hover:bg-rust-dark transition"
        >
          7日間 無料で試す
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-paper border-t border-rule">
      <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-ink-2">
        <div className="flex flex-wrap items-center gap-6">
          <span className="font-mincho font-bold text-ink">TowerSim</span>
          <Link href="/guide" className="hover:text-ink">使い方ガイド</Link>
          <Link href="/legal/privacy" className="hover:text-ink">プライバシーポリシー</Link>
          <Link href="/legal/terms" className="hover:text-ink">利用規約</Link>
          <Link href="/legal/tokushoho" className="hover:text-ink">特定商取引法に基づく表記</Link>
          <a href="mailto:support@upthemoon.co.jp" className="hover:text-ink">お問い合わせ</a>
        </div>
        <div className="mt-6 text-xs">
          © 2026 Up the Moon LLC. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
