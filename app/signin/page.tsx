import { Suspense } from "react";
import Link from "next/link";
import { SigninForm } from "./SigninForm";
import { TowerIcon } from "../components/TowerIcon";

export const dynamic = "force-dynamic";

export default function SigninPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper bg-blueprint px-6 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <TowerIcon size={40} className="text-steel-dark" />
        <span className="font-mincho text-2xl font-bold tracking-wider text-ink">TowerSim</span>
      </Link>
      <div className="w-full max-w-sm bg-paper-2/60 border-2 border-steel-dark rounded-lg shadow-xl p-8">
        <Suspense fallback={<div className="text-center text-ink-2">読み込み中…</div>}>
          <SigninForm />
        </Suspense>
      </div>
      <p className="mt-6 text-xs text-ink-2">
        サインインすると{" "}
        <Link href="/legal/terms" className="underline">利用規約</Link> と{" "}
        <Link href="/legal/privacy" className="underline">プライバシーポリシー</Link>{" "}
        に同意したものとみなします。
      </p>
    </div>
  );
}
