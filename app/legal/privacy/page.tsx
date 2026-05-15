import Link from "next/link";
import { TowerIcon } from "../../components/TowerIcon";

export const metadata = {
  title: "プライバシーポリシー | TowerSim",
};

export default function PrivacyPage() {
  return (
    <div className="bg-paper min-h-screen">
      <LegalHeader />
      <article className="max-w-3xl mx-auto px-6 py-12 text-ink">
        <h1 className="font-mincho text-3xl font-bold">プライバシーポリシー</h1>
        <p className="mt-2 text-sm text-ink-2">最終更新日: 2026年5月13日</p>

        <p className="mt-6 leading-relaxed">
          吉岡 涼（屋号: Up the Moon、以下「当方」）は、当方が提供するクラウドサービス「TowerSim」（以下「本サービス」）における利用者の個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。本ポリシーは、本サービスの利用にあたって取得・利用する個人情報の取扱いを規定するものです。なお、2026 年 7 月以降に Up the Moon合同会社へ事業譲渡を予定しており、譲渡時には本ポリシー上の事業者名を変更します。
        </p>

        <Section title="1. 取得する情報">
          <p>当方は、本サービスの提供に必要な範囲で以下の情報を取得します。</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>メールアドレス、表示名</li>
            <li>OAuth 認証時にプロバイダ（Google・Apple 等）から取得する識別子、メールアドレス、氏名</li>
            <li>クレジットカード情報（決済代行 Stripe, Inc. が直接取得・処理し、当方はカード番号自体を保持しません）</li>
            <li>サブスクリプション状態・契約期間・解約状況</li>
            <li>サービス利用ログ（アクセス日時、IP アドレス、利用デバイス情報）</li>
            <li>本サービス内で利用者が登録・保存した案件データ（シナリオ・計算結果）</li>
          </ul>
        </Section>

        <Section title="2. 利用目的">
          <ul className="list-disc pl-6 space-y-1">
            <li>本サービスの提供・運営・保守</li>
            <li>本人確認、アカウント管理、課金・決済処理</li>
            <li>利用規約違反・不正利用の検知および対応</li>
            <li>カスタマーサポートの提供、お問合せへの対応</li>
            <li>本サービスの改善および新機能開発のための分析</li>
            <li>サービスに関する重要なお知らせ・更新情報の通知</li>
          </ul>
        </Section>

        <Section title="3. 第三者提供">
          <p>
            当方は、法令に基づく場合を除き、利用者の同意を得ずに個人情報を第三者に提供しません。
          </p>
        </Section>

        <Section title="4. 業務委託（サブプロセッサー）">
          <p>本サービスの提供にあたり、以下の事業者に個人情報の処理を委託しています。</p>
          <table className="w-full mt-3 border-collapse text-sm">
            <thead>
              <tr className="border-b border-rule">
                <th className="text-left py-2 pr-4">委託先</th>
                <th className="text-left py-2 pr-4">委託内容</th>
                <th className="text-left py-2">所在地</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-rule">
                <td className="py-2 pr-4">Supabase, Inc.</td>
                <td className="py-2 pr-4">認証・データベース・ストレージ</td>
                <td className="py-2">米国（東京リージョン保管）</td>
              </tr>
              <tr className="border-b border-rule">
                <td className="py-2 pr-4">Stripe Payments Japan株式会社 / Stripe, Inc.</td>
                <td className="py-2 pr-4">クレジットカード決済処理</td>
                <td className="py-2">日本・米国</td>
              </tr>
              <tr className="border-b border-rule">
                <td className="py-2 pr-4">Vercel, Inc.</td>
                <td className="py-2 pr-4">Web ホスティング・配信</td>
                <td className="py-2">米国</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Google LLC / Apple Inc.</td>
                <td className="py-2 pr-4">OAuth 認証（利用者が利用を選択した場合のみ）</td>
                <td className="py-2">米国</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="5. 保存期間">
          <p>個人情報は、利用目的の達成に必要な期間および法令で定められた期間、保管します。利用者が退会した場合、原則として速やかにアカウントおよび関連データを削除しますが、税務・会計法令上保管義務がある決済関連記録（請求書、領収書等）は、当該義務期間中保管します。</p>
        </Section>

        <Section title="6. 安全管理措置">
          <p>当方は、個人情報への不正アクセス、紛失、改ざん、漏えい等を防止するため、以下を含む合理的かつ適切な安全管理措置を実施します。</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>通信の暗号化（HTTPS / TLS）</li>
            <li>データベースの行レベルセキュリティ（RLS）による利用者ごとのアクセス制御</li>
            <li>本番環境へのアクセス制限（最小権限の原則）</li>
            <li>定期的なセキュリティレビュー</li>
          </ul>
        </Section>

        <Section title="7. 利用者の権利">
          <p>利用者は当方に対し、自己の個人情報の開示・訂正・追加・削除・利用停止を請求することができます。請求は <a href="mailto:support@upthemoon.co.jp" className="text-rust underline">support@upthemoon.co.jp</a> までご連絡ください。本人確認のうえ、合理的な期間内に対応します。</p>
        </Section>

        <Section title="8. Cookie 等">
          <p>本サービスは、認証セッションの維持およびサービス改善のためにブラウザに Cookie 等を保存します。利用者はブラウザの設定により Cookie の受入れを拒否できますが、その場合、本サービスの一部機能が利用できなくなる可能性があります。</p>
        </Section>

        <Section title="9. 改定">
          <p>本ポリシーは、法令の改正や本サービスの内容変更に応じて改定することがあります。重要な変更がある場合、本サービス内で利用者に通知します。</p>
        </Section>

        <Section title="10. お問合せ窓口">
          <address className="not-italic">
            吉岡 涼（屋号: Up the Moon）<br />
            メール: <a href="mailto:support@upthemoon.co.jp" className="text-rust underline">support@upthemoon.co.jp</a>
          </address>
        </Section>
      </article>
      <LegalFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-mincho text-xl font-bold border-l-4 border-rust pl-3">{title}</h2>
      <div className="mt-4 leading-relaxed text-ink-2">{children}</div>
    </section>
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
