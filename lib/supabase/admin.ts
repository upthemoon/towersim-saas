import { createClient } from "@supabase/supabase-js";

/**
 * service_role キーを使う管理用 Supabase クライアントを生成する。
 *
 * RLS をバイパスするため、サーバ側 (route handler / runtime=nodejs) からのみ呼ぶこと。
 * ブラウザや Edge には絶対に持ち込まない。
 *
 * env (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) が未設定のまま実行されると、
 * 以前は `!` 強制キャストで undefined のまま createClient に渡り、検出が実リクエスト時まで遅れていた。
 * ここで明示的に throw することで、staging での設定漏れを最初の呼び出しで即座に検出する。
 */
export function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL) throw new Error("NEXT_PUBLIC_SUPABASE_URL not set");
  if (!SERVICE_ROLE) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
