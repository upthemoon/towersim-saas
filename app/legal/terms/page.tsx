import Link from "next/link";
import { TowerIcon } from "../../components/TowerIcon";
import { TRIAL_DAYS } from "@/lib/subscription";

export const metadata = {
  title: "利用規約 | TowerSim",
};

export default function TermsPage() {
  return (
    <div className="bg-paper min-h-screen">
      <LegalHeader />
      <article className="max-w-3xl mx-auto px-6 py-12 text-ink">
        <h1 className="font-mincho text-3xl font-bold">利用規約</h1>
        <p className="mt-2 text-sm text-ink-2">最終更新日: 2026年6月14日</p>

        <p className="mt-6 leading-relaxed">
          本利用規約（以下「本規約」）は、Up the Moon合同会社（以下「当社」）が提供するクラウドサービス「TowerSim」（以下「本サービス」）の利用条件を定めるものです。利用者は本規約に同意のうえ、本サービスを利用するものとします。
        </p>

        <Section title="第1条（適用）">
          <p>本規約は、本サービスの利用に関する当社と利用者との一切の関係に適用されます。</p>
        </Section>

        <Section title="第2条（定義）">
          <ul className="list-disc pl-6 space-y-1">
            <li>「利用者」とは、本規約に同意のうえ本サービスを利用するすべての者をいいます。</li>
            <li>「アカウント」とは、利用者が本サービスを利用するために当社に登録した識別情報をいいます。</li>
            <li>「有料プラン」とは、本サービスのうち月額または年額の料金を支払って利用するプランをいいます。</li>
            <li>「試用期間」とは、新規登録から{TRIAL_DAYS}日間、無料で有料プランと同等の機能を利用できる期間をいいます。</li>
          </ul>
        </Section>

        <Section title="第3条（登録）">
          <ol className="list-decimal pl-6 space-y-2">
            <li>本サービスの利用を希望する者は、当社所定の方法でアカウント登録を行うものとします。</li>
            <li>登録情報に虚偽があった場合、当社は登録の取消し、または本サービスの利用停止を行うことができます。</li>
            <li>利用者は、自身のアカウント情報を厳重に管理し、第三者に利用させてはなりません。アカウントの管理不十分による損害について、当社は責任を負いません。</li>
          </ol>
        </Section>

        <Section title="第4条（料金・支払）">
          <ol className="list-decimal pl-6 space-y-2">
            <li>本サービスの料金は、本サービス内で表示する金額（消費税込み）とします。</li>
            <li>有料プランは月額または年額の自動更新型サブスクリプションです。解約手続きが行われない限り、契約期間満了時に自動的に同一プランで更新されます。</li>
            <li>支払いは、Stripe を経由したクレジットカード決済によるものとします。</li>
            <li>支払いが完了しなかった場合、当社は本サービスの提供を停止することがあります。</li>
          </ol>
        </Section>

        <Section title="第5条（試用期間）">
          <ol className="list-decimal pl-6 space-y-2">
            <li>新規アカウント登録者には、{TRIAL_DAYS}日間の試用期間を提供します。</li>
            <li>試用期間中はクレジットカード登録不要で全機能を利用できます。</li>
            <li>試用期間終了後に継続利用するには、有料プランへの加入が必要です。試用期間中に有料プランへ加入した場合、試用期間終了時に解約しない限り、選択したプランで自動的に課金が開始されます。</li>
          </ol>
        </Section>

        <Section title="第6条（解約・プラン変更）">
          <ol className="list-decimal pl-6 space-y-2">
            <li>利用者はいつでも本サービスの利用を停止し、有料プランを解約することができます。</li>
            <li>解約は当該契約期間の末日まで有効とし、期間内の日割り返金は行いません。</li>
            <li>月額プランから年額プラン（またはその逆）への変更は、Stripe Customer Portal を通じていつでも可能であり、未使用期間分の差額は自動的に日割り精算されます。</li>
          </ol>
        </Section>

        <Section title="第7条（禁止事項）">
          <p>利用者は、本サービスの利用にあたって以下の行為を行ってはなりません。</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>法令・公序良俗に反する行為</li>
            <li>当社、他の利用者または第三者の知的財産権・プライバシーその他の権利を侵害する行為</li>
            <li>本サービスの運営を妨害する行為（リバースエンジニアリング、自動化されたスクレイピング、過度な API 呼出等を含む）</li>
            <li>不正アクセス、コンピュータウイルスの送信、システムへの過剰な負荷をかける行為</li>
            <li>本サービスを利用して得た情報を、本サービスの目的外で利用する行為</li>
            <li>アカウントを第三者に譲渡・貸与する行為</li>
            <li>当社が不適切と合理的に判断する行為</li>
          </ul>
        </Section>

        <Section title="第8条（サービスの変更・中断・終了）">
          <ol className="list-decimal pl-6 space-y-2">
            <li>当社は、利用者への事前通知なく本サービスの内容を変更し、または提供を中断・終了することができます。</li>
            <li>本サービスの変更・中断・終了によって利用者に生じた損害について、当社は責任を負いません。</li>
          </ol>
        </Section>

        <Section title="第9条（知的財産権）">
          <p>本サービスおよび本サービスに関連する一切の知的財産権は、当社または正当な権利者に帰属します。利用者は、本サービスを通じて取得したコンテンツを、本サービスの目的外で複製、転用、公衆送信してはなりません。</p>
          <p className="mt-3">利用者が本サービスに入力したデータ（案件情報、計算結果等）の知的財産権は利用者に帰属するものとし、当社はサービス提供に必要な範囲でこれを利用できるものとします。</p>
        </Section>

        <Section title="第10条（免責事項）">
          <ol className="list-decimal pl-6 space-y-2">
            <li>本サービスは、現状有姿で提供されるものであり、当社は本サービスの完全性、正確性、適合性、有用性、安全性等について、明示または黙示を問わず一切の保証をしません。</li>
            <li>本サービスが提供する計算結果は参考情報であり、最終的な判断は利用者の責任において行うものとします。本サービスの計算結果に基づいて行われた契約・取引・経営判断について、当社は責任を負いません。</li>
            <li>当社が利用者に対して負う責任は、当社の故意または重過失による場合を除き、当該損害が発生した月に利用者が当社に支払った料金を上限とします。</li>
          </ol>
        </Section>

        <Section title="第11条（個人情報）">
          <p>当社は、利用者の個人情報を <Link href="/legal/privacy" className="text-rust underline">プライバシーポリシー</Link> に従って取扱います。</p>
        </Section>

        <Section title="第12条（規約の変更）">
          <p>当社は、本規約を変更することができます。変更後の規約は本サービス上に掲載した時点から効力を生じ、その後の本サービスの利用は変更後の規約への同意とみなされます。</p>
        </Section>

        <Section title="第13条（準拠法・管轄）">
          <p>本規約の準拠法は日本法とし、本サービスに関する紛争については、名古屋地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
        </Section>

        <p className="mt-12 text-sm text-ink-2">以上</p>
      </article>
      <LegalFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-mincho text-xl font-bold border-l-4 border-rust pl-3">{title}</h2>
      <div className="mt-3 leading-relaxed text-ink-2">{children}</div>
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
