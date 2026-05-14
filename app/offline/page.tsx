import Link from "next/link";
import { TowerIcon } from "../components/TowerIcon";

export const metadata = {
  title: "オフライン — TowerSim",
  description: "ネットワークに接続できないとき表示されるフォールバックページ",
};

export default function OfflinePage() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <TowerIcon size={64} className="text-steel-dark mx-auto mb-6" />
        <h1 className="font-mincho text-2xl font-bold text-ink mb-3">
          オフラインです
        </h1>
        <p className="text-ink-2 text-sm leading-relaxed mb-8">
          ネットワーク接続が確認できません。<br />
          一度開いたシミュレーターはオフラインでも動作します。
        </p>
        <div className="flex flex-col gap-3 items-center">
          <Link
            href="/app"
            className="inline-flex items-center justify-center min-w-[200px] h-11 px-5 rounded bg-steel-dark text-paper font-medium hover:bg-steel transition"
          >
            シミュレーターを開く
          </Link>
          <Link
            href="/"
            className="text-sm text-ink-2 hover:text-ink underline underline-offset-4"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
