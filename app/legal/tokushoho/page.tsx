import Link from "next/link";
import { TowerIcon } from "../../components/TowerIcon";

export const metadata = {
  title: "特定商取引法に基づく表記 | TowerSim",
};

export default function TokushohoPage() {
  return (
    <div className="bg-paper min-h-screen">
      <LegalHeader />
      <article className="max-w-3xl mx-auto px-6 py-12 text-ink">
        <h1 className="font-mincho text-3xl font-bold">特定商取引法に基づく表記</h1>
        <p className="mt-2 text-sm text-ink-2">最終更新日: 2026年5月13日</p>

        <table className="w-full mt-8 border-collapse">
          <tbody>
            <Row label="販売事業者">
              吉岡 涼（屋号: Up the Moon）
              <br />
              <span className="text-sm text-ink-2">※ 2026 年 7 月以降 Up the Moon合同会社に事業譲渡予定</span>
            </Row>
            <Row label="運営統括責任者">
              吉岡 涼
            </Row>
            <Row label="所在地">
              請求があった場合に遅滞なく開示します。<br />
              <span className="text-sm text-ink-2">※ ご請求は下記「お問合せ先」までメールでお願いします。</span>
            </Row>
            <Row label="電話番号">
              請求があった場合に遅滞なく開示します。<br />
              <span className="text-sm text-ink-2">※ ご請求は下記「お問合せ先」までメールでお願いします。</span>
            </Row>
            <Row label="お問合せ先">
              メール: <a href="mailto:support@upthemoon.co.jp" className="text-rust underline">support@upthemoon.co.jp</a><br />
              <span className="text-sm text-ink-2">原則として 3 営業日以内に返信いたします。</span>
            </Row>
            <Row label="販売価格">
              <ul className="list-disc pl-5 space-y-1">
                <li>月額プラン: 3,000 円（税込）/ 月</li>
                <li>年額プラン: 30,000 円（税込）/ 年</li>
              </ul>
            </Row>
            <Row label="商品代金以外の必要料金">
              インターネット接続料金・通信料金等は利用者負担となります。
            </Row>
            <Row label="支払方法">
              クレジットカード決済（Visa / Mastercard / American Express / JCB / Diners 等）。決済は Stripe Payments Japan株式会社 を介して行われます。
            </Row>
            <Row label="支払時期">
              <p>初回お支払い: 試用期間終了後、自動的に課金されます。</p>
              <p>2回目以降: 直前の更新日と同日に自動更新・課金されます。</p>
            </Row>
            <Row label="商品の引渡時期">
              アカウント登録および試用期間開始と同時に、本サービスを直ちに利用可能となります。
            </Row>
            <Row label="返品・キャンセル">
              <p>本サービスは、その性質上、ご利用開始後の返金・返品には応じかねます。</p>
              <p>有料プランの解約は、本サービス内の「請求」ページから随時可能です。解約手続きを行った場合、当該契約期間の末日まで本サービスをご利用いただけますが、未使用期間分の日割り返金は行いません。</p>
              <p className="mt-2">プラン変更（月額 ⇄ 年額）を行った場合は、Stripe Customer Portal の機能により未使用期間分の差額が自動的に日割り精算されます。</p>
              <p className="mt-2 text-sm text-ink-2">※ 試用期間中に解約された場合は、料金は一切発生しません。</p>
            </Row>
            <Row label="動作環境">
              <ul className="list-disc pl-5 space-y-1">
                <li>最新版の Chrome / Safari / Edge / Firefox</li>
                <li>iOS 15 以上の iPhone / iPad</li>
                <li>Android 10 以上</li>
              </ul>
            </Row>
          </tbody>
        </table>
      </article>
      <LegalFooter />
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-rule align-top">
      <th className="py-4 pr-6 text-left text-sm font-bold text-steel-dark w-36 md:w-48">{label}</th>
      <td className="py-4 leading-relaxed text-ink-2">{children}</td>
    </tr>
  );
}

function LegalHeader() {
  return (
    <header className="border-b border-rule bg-paper/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <TowerIcon size={28} className="text-steel-dark" />
          <span className="font-mincho text-lg font-bold tracking-wider text-ink">TowerSim</span>
        </Link>
        <Link href="/" className="text-sm text-steel-dark underline">トップへ戻る</Link>
      </div>
    </header>
  );
}

function LegalFooter() {
  return (
    <footer className="border-t border-rule mt-12">
      <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-ink-2 flex flex-wrap gap-6">
        <Link href="/legal/privacy" className="hover:text-ink">プライバシーポリシー</Link>
        <Link href="/legal/terms" className="hover:text-ink">利用規約</Link>
        <Link href="/legal/tokushoho" className="hover:text-ink">特定商取引法に基づく表記</Link>
        <a href="mailto:support@upthemoon.co.jp" className="hover:text-ink">お問い合わせ</a>
      </div>
    </footer>
  );
}
