-- =====================================================================
-- TowerSim SaaS 初期スキーマ
-- 実行: Supabase Dashboard → SQL Editor → New Query → 全文貼付 → Run
-- すべて idempotent
-- =====================================================================

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  subscription_status text not null default 'none'
    check (subscription_status in ('trialing','active','past_due','canceled','expired','none')),
  plan text check (plan in ('monthly','yearly')),
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_stripe_customer on public.profiles(stripe_customer_id);

-- updated_at の自動更新
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- RLS: ユーザーは自分の profile だけ読める。書き込みは Webhook (service_role) のみ。
alter table public.profiles enable row level security;

drop policy if exists "user_read_own_profile" on public.profiles;
create policy "user_read_own_profile" on public.profiles
  for select using (auth.uid() = user_id);

-- ユーザー側からの insert は ensureProfile で行う（初回のみ trialing で作る）。
drop policy if exists "user_insert_own_profile" on public.profiles;
create policy "user_insert_own_profile" on public.profiles
  for insert with check (auth.uid() = user_id);

-- 直接 update は禁止。プラン変更は必ず Stripe Webhook 経由（service_role）。


-- =====================================================================
-- 案件シナリオ保存（Phase 2 で使う・先にテーブルだけ用意）
-- =====================================================================
create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_scenarios_user on public.scenarios(user_id, updated_at desc);

alter table public.scenarios enable row level security;

drop policy if exists "user_crud_own_scenarios" on public.scenarios;
create policy "user_crud_own_scenarios" on public.scenarios
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists trg_scenarios_touch on public.scenarios;
create trigger trg_scenarios_touch before update on public.scenarios
  for each row execute function public.touch_updated_at();


-- =====================================================================
-- 実行確認
-- =====================================================================
select 'profiles' as t, count(*)::text as result from information_schema.tables
  where table_schema='public' and table_name='profiles'
union all
select 'scenarios', count(*)::text from information_schema.tables
  where table_schema='public' and table_name='scenarios'
union all
select 'policies', count(*)::text from pg_policies where schemaname='public' and tablename in ('profiles','scenarios');
