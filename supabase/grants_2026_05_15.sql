-- ============================================================================
-- Supabase Data API 仕様変更対応 (2026-05-30 / 2026-10-30)
--
-- 背景: 2026-05-30 から新規プロジェクトは public schema の自動 GRANT が外れる。
-- 2026-10-30 から既存プロジェクトも同様に強制される。
-- supabase-js / PostgREST / GraphQL からアクセスする全テーブルに対し、
-- 明示的な GRANT が必要。
--
-- 本ファイル: TowerSim 用。Supabase Dashboard の SQL Editor で実行する。
-- 既存テーブルへの破壊的変更は無し (GRANT 追加のみ)。
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: ログインユーザーが自分の行のみ参照・更新可能
-- (RLS で user_id = auth.uid() に絞られる)
-- ----------------------------------------------------------------------------
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;
-- anon (未ログイン) には何も付与しない

-- ----------------------------------------------------------------------------
-- scenarios: ログインユーザーが自分のシナリオを CRUD 可能
-- ----------------------------------------------------------------------------
grant select, insert, update, delete on public.scenarios to authenticated;
grant select, insert, update, delete on public.scenarios to service_role;
-- anon には何も付与しない

-- ----------------------------------------------------------------------------
-- 確認クエリ (実行後にエラーが無いことを確認するための SELECT)
-- ----------------------------------------------------------------------------
-- select table_name, grantee, privilege_type
-- from information_schema.table_privileges
-- where table_schema = 'public' and grantee in ('anon', 'authenticated', 'service_role')
-- order by table_name, grantee, privilege_type;
