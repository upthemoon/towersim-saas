# TowerSim SaaS

建設業・運送業など労務原価が中心の業種向け、原価・交渉シミュレーター SaaS。

- **本番ドメイン**: https://towersim.upthemoon.co.jp
- **技術**: Next.js 16 (App Router) + Tailwind CSS v4 + Supabase Auth + Stripe + Vercel + PWA
- **GitHub**: `upthemoon/towersim-saas` (Public)
- **シミュレーター本体**: `public/simulator.html` (Vanilla JS / CSS, iframe で `/app` に組み込み)

## アーキテクチャ

```
LP (/)                       → 静的レンダリング
/guide                       → 使い方ガイド（PWA install / offline / 全機能取説）
/signin                      → Email / Google / Apple OAuth
/auth/callback               → OAuth code → Supabase session
/app                         → 認証 + サブスク (active or trialing) 必須・simulator.html を iframe
/billing                     → プラン選択 + Customer Portal 切替
/offline                     → Service Worker フォールバック
/legal/{privacy,terms,tokushoho} → 法的表記
/api/checkout                → Stripe Checkout セッション作成
/api/billing-portal          → Stripe Customer Portal セッション
/api/stripe/webhook          → Stripe イベント → profiles upsert
/manifest.webmanifest        → PWA manifest (Next.js が自動生成)
/sw.js                       → Service Worker (本番のみ登録)
/sitemap.xml, /robots.txt    → SEO
/opengraph-image             → OGP 画像 (1200x630 PNG, ImageResponse 経由)
```

## ローカル起動

```bash
npm install
npm run dev    # http://localhost:3000
```

`.env.local.example` を `.env.local` にコピーして必要な値を埋める。

---

# 運用 runbook

## 環境変数 (Vercel)

| キー | 用途 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase 認証・DB |
| `STRIPE_SECRET_KEY` | Stripe API (test or live) |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook signing secret |
| `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_YEARLY` | 月額・年額の price ID |
| `NEXT_PUBLIC_APP_URL` | https://towersim.upthemoon.co.jp |

設定変更後 Vercel で再デプロイが必要。

## Stripe 本番モード切替手順 (Phase C)

1. Stripe Dashboard 右上で **Test mode → Live mode** に切替
2. **Products** で月額 ¥3,000 / 年額 ¥30,000 を Live で再作成 → Price ID 取得
3. **Developers → API keys** から Live の secret key を取得
4. **Developers → Webhooks** で本番 endpoint 作成
   - URL: `https://towersim.upthemoon.co.jp/api/stripe/webhook`
   - イベント: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - signing secret を取得
5. **Customer Portal** で「プラン変更時は自動 prorate」「期間末まで利用可」に設定
6. Vercel env に Live の 4 つ (`STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_YEARLY`) を上書き → 再デプロイ
7. 自分のアカウントでテスト課金 → Stripe Dashboard で確認 → 即返金 (Live)

## トラブル対応

### Stripe Webhook 失敗
- Stripe Dashboard → Developers → Webhooks → 該当 endpoint の **Logs** で失敗ログを確認
- 失敗時は同 dashboard から「Resend」可能
- `profiles.subscription_status` が反映されない場合は service_role キーが正しいか確認

### 認証ループ (`/signin` から `/app` に行けない)
- ブラウザの Cookie をクリア
- Supabase Dashboard → Authentication → URL Configuration の `Site URL` が `https://towersim.upthemoon.co.jp` になっているか確認
- Vercel env の `NEXT_PUBLIC_SUPABASE_URL` が正しいか

### PWA installability
- `https://towersim.upthemoon.co.jp/app` を Chrome DevTools の **Application → Manifest** で確認
- manifest が読めない / icon 404 ならビルド失敗

## メンテナンス

- 月 1 回 `npm outdated` でパッケージ更新確認
- Supabase / Stripe / Vercel ダッシュボードで利用量を月次でチェック
- 重要な更新は `/guide` の改訂日を更新

## 関連リンク

- [Supabase Dashboard](https://supabase.com/dashboard/project/zhrpfwksymzszufolpsp)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Vercel Project](https://vercel.com/up-the-moon-s-projects/towersim-saas)
- [GitHub Repo](https://github.com/upthemoon/towersim-saas)
