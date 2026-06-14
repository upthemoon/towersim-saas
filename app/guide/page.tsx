import Link from "next/link";
import type { Metadata } from "next";
import { TowerIcon } from "../components/TowerIcon";
import { TRIAL_DAYS } from "@/lib/subscription";

export const metadata: Metadata = {
  title: "使い方ガイド — TowerSim",
  description:
    "TowerSim の全機能取説。PWA インストール手順 (iPhone / Android)、オフライン利用、3 タブの使い分け、コスト按分、感度テーブル、案件保存、プラン管理まで。",
  alternates: { canonical: "/guide" },
};

const sections: { id: string; title: string }[] = [
  { id: "intro", title: "TowerSim とは" },
  { id: "install", title: "ホーム画面に追加 (スマホ)" },
  { id: "offline", title: "オフライン利用" },
  { id: "tabs", title: "3 つのタブの使い分け" },
  { id: "cost", title: "コストの入力と按分" },
  { id: "waterfall", title: "単価階層分解と感度テーブル" },
  { id: "projects", title: "案件の保存・一覧・読込" },
  { id: "export", title: "PDF / JSON 出力" },
  { id: "theme", title: "ライト / ダーク切替" },
  { id: "billing", title: "プラン管理・解約" },
  { id: "industries", title: "業種別の使い方" },
  { id: "faq", title: "よくある質問" },
];

export default function GuidePage() {
  return (
    <>
      <header className="border-b border-rule bg-paper/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <TowerIcon size={28} className="text-steel-dark" />
            <span className="font-mincho text-lg font-bold tracking-wider text-ink">TowerSim</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/signin" className="text-ink-2 hover:text-ink">ログイン</Link>
            <Link
              href="/signin?mode=signup"
              className="bg-steel text-paper px-4 py-2 rounded font-bold hover:bg-steel-dark transition"
            >
              無料で始める
            </Link>
          </nav>
        </div>
      </header>

      <main className="bg-paper">
        <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-[1fr_240px] gap-12">
          <article className="guide-prose max-w-none text-ink">
            <span className="stamp text-xs">使い方ガイド</span>
            <h1 className="font-mincho text-3xl md:text-4xl font-bold mt-4 mb-6 leading-tight">
              TowerSim の使い方
            </h1>
            <p className="text-ink-2 leading-relaxed">
              総額提示案件・単価交渉・受注可否判断を 1 つのシミュレーターで完結させるためのガイドです。
              スマホでもパソコンでも同じ操作感で使えます。
            </p>

            <Section id="intro" title="TowerSim とは">
              <p>
                建設業・運送業など、<strong>労務原価が中心の業種</strong>向けの原価・交渉シミュレーターです。
                工事の総額が先に提示されている案件、単価交渉が必要な案件、社内採算が成り立つかどうかを判断したい案件、
                それぞれを 3 つのタブで切り替えながら検証できます。
              </p>
              <p>計算式はすべて画面上に表示され、なぜその数字になったのかが追跡可能です。</p>
            </Section>

            <Section id="install" title="ホーム画面に追加 (スマホ)">
              <p>
                スマホで使う場合は、ブラウザのままよりも「ホーム画面に追加」してアプリのように起動すると、
                アドレスバーがなくなって画面が広く使え、起動も速くなります。
              </p>
              <SubHead>iPhone / iPad の場合</SubHead>
              <ol>
                <li>Safari で <code>towersim.upthemoon.co.jp/app</code> を開く</li>
                <li>下の中央にある共有ボタン（□ に上矢印）をタップ</li>
                <li>メニューから <strong>「ホーム画面に追加」</strong> をタップ</li>
                <li>名前は「TowerSim」のままで <strong>「追加」</strong></li>
                <li>ホーム画面に鉄塔アイコンが出るので、そこから起動</li>
              </ol>
              <SubHead>Android (Chrome) の場合</SubHead>
              <ol>
                <li>Chrome で <code>towersim.upthemoon.co.jp/app</code> を開く</li>
                <li>右上のメニュー（︙）をタップ</li>
                <li><strong>「ホーム画面に追加」</strong> または「アプリをインストール」</li>
                <li>ホーム画面のアイコンから起動</li>
              </ol>
              <Callout>
                ホーム画面から起動すると <strong>standalone モード</strong> で動き、Safari/Chrome の UI が消えてフルスクリーンで使えます。
              </Callout>
            </Section>

            <Section id="offline" title="オフライン利用">
              <p>
                一度起動した端末では、その後ネットワークが切れても TowerSim の本体（計算機能・既に開いた案件）は使えます。
                Service Worker がアプリ本体をキャッシュしているためです。
              </p>
              <p>
                オフライン中にできること：
              </p>
              <ul>
                <li>各タブでの金額・単価・人数・日数の計算</li>
                <li>コストカードの追加・削除・編集</li>
                <li>その端末のローカルに保存されている案件の閲覧・編集</li>
                <li>PDF 出力（端末側で生成）</li>
                <li>JSON 出力（端末ファイルに保存）</li>
              </ul>
              <p>オフライン中にできないこと：</p>
              <ul>
                <li>ログイン / ログアウト</li>
                <li>プラン変更・解約（Stripe 通信が必要）</li>
                <li>クラウド経由の案件同期（現バージョンでは未対応）</li>
              </ul>
            </Section>

            <Section id="tabs" title="3 つのタブの使い分け">
              <p>シミュレーターには 3 つのタブがあり、案件のタイプに合わせて使い分けます。</p>
              <SubHead>① 総額提示案件</SubHead>
              <p>
                元請から「この工事 ¥X 万円で」と <strong>総額が先に提示</strong>されている案件で、
                その金額で本当に利益が出るかを検証します。契約金額・人数・日数・コストから「実質 1 人工単価」を算出。
              </p>
              <SubHead>② 単価交渉 (2 単価比較)</SubHead>
              <p>
                <strong>現在の単価</strong>と <strong>提案したい単価</strong>を並べて、
                どちらがどれだけ採算性が高いかを比較。元請との交渉時に「なぜこの単価が必要か」を数字で示すための画面。
              </p>
              <SubHead>③ 受注可否判断 (単一単価)</SubHead>
              <p>
                一つの単価が提示されたときに <strong>受けるか断るか</strong>を即決するための画面。
                損益分岐・必要単価・実費請求の有無まで含めて判定します。
              </p>
              <Callout>
                タブ ① と ② は <strong>双方向コピー</strong>できるので、同じ案件を別視点で検証可能。
              </Callout>
            </Section>

            <Section id="cost" title="コストの入力と按分">
              <p>各タブの下部にコストカードがあり、案件にかかる費用を追加できます。</p>
              <SubHead>按分基準</SubHead>
              <ul>
                <li><strong>固定費</strong> — 案件専用にかかる固定額（外注費・許可申請費など）</li>
                <li><strong>月額按分</strong> — 月いくらの費用を「標準日数 ÷ 案件日数」で按分（事務所家賃・車両リース等）</li>
                <li><strong>人件費</strong> — 人件費フラグが付いた項目は法定福利費 (16.5%) が自動加算される</li>
              </ul>
              <SubHead>プリセット候補</SubHead>
              <p>
                入力欄にフォーカスすると、よくある費目候補（13 種類）が表示されるので選ぶだけで按分基準と人件費フラグが自動セットされます。
              </p>
            </Section>

            <Section id="waterfall" title="単価階層分解と感度テーブル">
              <SubHead>単価階層分解 (waterfall)</SubHead>
              <p>
                給与 → +法定福利費 → +諸経費 → 損益分岐単価 → +目標利益 → 必要単価、というように
                <strong>1 人工単価がどう積み上がるか</strong>を画面で順に表示します。
              </p>
              <SubHead>感度テーブル</SubHead>
              <p>
                単価や契約金額を 7 段階前後動かしたときに、利益がどう変わるかを表で表示。
                損益分岐と必要単価がどの段にあるかも色付きで分かります。
              </p>
            </Section>

            <Section id="projects" title="案件の保存・一覧・読込">
              <SubHead>保存</SubHead>
              <p>
                上部の <strong>「📁 保存」</strong>ボタンで案件をローカルストレージに保存。案件名・工種・年度を付けて整理します。
              </p>
              <SubHead>一覧</SubHead>
              <p>
                <strong>「📋 案件一覧」</strong>から検索・年度/工種で絞り込み・並び替え・コピー・統計表示が可能。
              </p>
              <SubHead>新規</SubHead>
              <p>
                <strong>「📄 新規」</strong>で全項目をクリアして新しい案件の入力を開始。
              </p>
            </Section>

            <Section id="export" title="PDF / JSON 出力">
              <SubHead>PDF 出力</SubHead>
              <p>
                <strong>「🖨 PDF 出力」</strong>で現在開いているタブの内容を白基調の印刷向けレイアウトで PDF 化。
                案件名・出力日・工種・契約金額・体制がヘッダーに自動で入ります。
              </p>
              <SubHead>JSON 出力 / 読込</SubHead>
              <p>
                <strong>「⬇ JSON 出力」</strong>で案件データを JSON ファイルに書き出し、<strong>「⬆ JSON 読込」</strong>で復元。
                端末間や別アカウントへの移行に使えます。
              </p>
            </Section>

            <Section id="theme" title="ライト / ダーク切替">
              <p>
                右上の <strong>🌙 / ☀</strong> アイコンでテーマを切り替えられます。設定はブラウザに保存され、次回も維持されます。
                初回はシステムの設定に従います。
              </p>
            </Section>

            <Section id="billing" title="プラン管理・解約">
              <p>
                ヘッダーの <strong>「請求」</strong>リンクから、現在のプラン状況確認・プラン変更・解約ができます。
              </p>
              <ul>
                <li><strong>試用期間</strong> {TRIAL_DAYS} 日間（クレジットカード登録不要）</li>
                <li><strong>月額</strong> ¥3,000 / <strong>年額</strong> ¥30,000（年額は 17% お得）</li>
                <li>プラン変更時は <strong>差額が自動で日割り精算</strong>（Stripe Customer Portal で完結）</li>
                <li>解約はいつでも可能。期間末まで利用可。</li>
              </ul>
            </Section>

            <Section id="industries" title="業種別の使い方">
              <SubHead>建設業 (送電線鉄塔・電気工事・土木)</SubHead>
              <p>
                総額提示案件は元請からの一括発注、単価交渉は人工単価の交渉、受注可否は採算判定に使います。
                工種は datalist から選択（22 種類）。法定福利費 16.5% は自動計算。
              </p>
              <SubHead>運送業</SubHead>
              <p>
                ドライバー人件費・車両費・燃料費・高速代を <strong>コストカードに入れて</strong> 案件単価を検証できます。
                月額按分で固定費（車両リース・保険）を組み込み、案件単価が損益分岐を超えるかを判定。
                単価交渉タブで「現在の運賃 vs 希望運賃」の利益差を提示可能。
              </p>
              <SubHead>その他労務業種</SubHead>
              <p>
                人件費が原価の中心になる業種（清掃・警備・設備保守など）にも同じロジックで適用できます。
              </p>
            </Section>

            <Section id="faq" title="よくある質問">
              <SubHead>データはどこに保存される？</SubHead>
              <p>
                案件データは現バージョンでは <strong>使用している端末のブラウザ内（ローカルストレージ）</strong>に保存されます。
                JSON 出力でバックアップ・他端末への移行が可能です。アカウント情報のみ Supabase に保存されます。
              </p>
              <SubHead>パソコンとスマホで同じ案件を見れる？</SubHead>
              <p>
                現バージョンでは端末ごとにローカル保存のため、移行には JSON 出力 → 読込が必要です。
                クラウド同期は今後のバージョンで対応予定です。
              </p>
              <SubHead>解約後もデータは残る？</SubHead>
              <p>
                ローカル保存のデータは解約後もブラウザに残ります。アカウント自体の削除は、ログイン後の <Link href="/billing" className="text-rust underline">請求ページ</Link> 下部「アカウントを削除」からご自身で行えます（有効な有料プラン・試用中の契約がある場合は、削除と同時に自動で解約されます）。
              </p>
              <SubHead>うまく動かない</SubHead>
              <p>
                ブラウザを最新版に更新し、それでも改善しない場合は <a href="mailto:support@upthemoon.co.jp" className="text-rust underline">support@upthemoon.co.jp</a> までご連絡ください。
              </p>
            </Section>

            <div className="mt-16 border-t border-rule pt-8 flex flex-wrap gap-4">
              <Link
                href="/signin?mode=signup"
                className="bg-rust text-paper px-6 py-3 rounded font-bold hover:bg-rust-dark transition"
              >
                {TRIAL_DAYS}日間 無料で試す
              </Link>
              <Link
                href="/"
                className="border-2 border-ink text-ink px-6 py-3 rounded font-bold hover:bg-ink hover:text-paper transition"
              >
                トップへ戻る
              </Link>
            </div>
          </article>

          <aside className="hidden lg:block">
            <nav className="sticky top-20 border border-rule bg-paper-2 p-5 rounded">
              <div className="text-xs font-bold tracking-widest text-ink-2 mb-3">目 次</div>
              <ol className="space-y-1.5 text-sm">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-ink hover:text-rust">
                      {String(i + 1).padStart(2, "0")}. {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        </div>
      </main>

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
          <div className="mt-6 text-xs">© 2026 Up the Moon LLC. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-12 scroll-mt-20">
      <h2 className="font-mincho text-2xl font-bold text-ink border-b border-rule pb-2 mb-4">
        {title}
      </h2>
      <div className="space-y-3 text-ink-2 leading-relaxed">{children}</div>
    </section>
  );
}

function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mincho text-lg font-bold text-ink mt-6 mb-2">{children}</h3>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 p-4 bg-paper-2 border-l-4 border-rust rounded-r text-sm text-ink">
      {children}
    </div>
  );
}
