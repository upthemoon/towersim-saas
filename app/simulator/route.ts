import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile, canAccessApp } from "@/lib/subscription";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://towersim.upthemoon.co.jp";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/signin?redirect=/app", APP_URL));
  }

  const profile = await ensureProfile(supabase, user.id);
  if (!canAccessApp(profile)) {
    return NextResponse.redirect(new URL("/billing?reason=expired", APP_URL));
  }

  const filePath = path.join(process.cwd(), "private", "simulator.html");
  const html = await readFile(filePath, "utf-8");

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store, max-age=0, must-revalidate",
    },
  });
}
