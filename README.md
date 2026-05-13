# TowerSim SaaS

工務店・建設業向け 原価・交渉シミュレーター SaaS。

- **本番予定ドメイン**: https://towersim.upthemoon.co.jp
- **技術**: Next.js 16 (App Router) + Tailwind CSS v4 + Supabase Auth + Stripe Checkout
- **既存資産**: `/Users/sherlockholmes/TowerSim/assets/simulator.html` を `public/simulator.html` にコピーして iframe で利用

## アーキテクチャ

```
LP (/)                → 静的レンダリング
/signin               → Email / Google / Apple OAuth
/auth/callback        → OAuth code → Supabase session
/app                  → 認証 + サブスク (active or trialing) 必須・simulator.html を iframe
/billing              → プラン選択 + 現状ステータス
/api/checkout         → Stripe Checkout セッション作成
/api/stripe/webhook   → Stripe イベント受信 → profiles を upsert
middleware.ts         → /app /billing は未ログイン時 /signin にリダイレクト
```

## セットアップ

### 1. 環境変数

`.env.local.example` を `.env.local` にコピーして埋める。

### 2. Supabase プロジェクト作成

1. https://supabase.com/dashboard で新規プロジェクトを作成（既存の CaudexCare/Hitorinku プロジェクトとは別）
2. **Settings → API** から `URL` と `anon` と `service_role` をコピー → `.env.local`
3. **Authentication → Providers** で Email / Google / Apple を有効化
4. **SQL Editor** で `supabase/schema.sql` 全文を実行

### 3. Stripe 設定

1. Stripe Dashboard で **Product** を 2 つ作成
   - 月額 ¥3,000 / month
   - 年額 ¥30,000 / year
2. 各 price ID を `.env.local` の `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_YEARLY` に
3. **Developers → API keys** から secret key を `STRIPE_SECRET_KEY` に
4. **Developers → Webhooks → Add endpoint**
   - URL: `https://<your-vercel-url>/api/stripe/webhook`
   - イベント: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - signing secret を `STRIPE_WEBHOOK_SECRET` に

### 4. ローカル起動

```bash
npm run dev
# http://localhost:3000
```

### 5. デプロイ（Vercel）

1. Vercel に GitHub リポジトリ連携
2. 環境変数をすべて設定（Production / Preview）
3. ドメイン `towersim.upthemoon.co.jp` を Vercel に追加（CNAME 設定は upthemoon Org の DNS で）

## 既知の TODO

- Stripe Webhook の `current_period_end` 取得は subscription オブジェクトの形に依存（API バージョン差異あり）。本番動作確認時に再検証。
- /legal/* はプレースホルダー。公開前に本文差し替え必須。
- /app は iframe で simulator.html を表示。Phase 2 で React 化 + シナリオ Supabase 保存に移行予定。
