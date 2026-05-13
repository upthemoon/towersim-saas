import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * リクエストごとに Supabase の認証クッキーを refresh し、
 * `/app` 配下を保護する。/signin 系・/api/stripe/webhook は素通し。
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // env 未設定（セットアップ前）は middleware を素通し。LP と /signin の表示は env 不要。
  // /app /billing にアクセスがあれば SSR で env 不在を検知してエラー表示になる前提。
  const url = request.nextUrl;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = url.pathname.startsWith("/app") || url.pathname.startsWith("/billing");
  if (isProtected && !user) {
    const signin = url.clone();
    signin.pathname = "/signin";
    signin.searchParams.set("redirect", url.pathname);
    return NextResponse.redirect(signin);
  }

  return response;
}
