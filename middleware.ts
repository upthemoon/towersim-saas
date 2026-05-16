import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 静的ファイル / 内部 API / 公開ルートは除外
    // simulator.html はもう /public にない (private/ に移動済) → matcher 除外も不要
    "/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ttf|css|js)).*)",
  ],
};
