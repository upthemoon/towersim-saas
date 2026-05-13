"use client";

import { createBrowserClient } from "@supabase/ssr";

/** env 未設定 (セットアップ前) のときは null を返す。呼出側でガード必須。 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
