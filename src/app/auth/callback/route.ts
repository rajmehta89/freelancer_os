/**
 * OAuth Callback Handler — /auth/callback
 * Handles redirect from Supabase after Google OAuth or email confirmation.
 * Exchanges the auth code for a session, then redirects to the app.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient }                    from "@/lib/supabase/server";
import { log }                             from "@/lib/logger";

const FILE = "app/auth/callback/route.ts";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code     = searchParams.get("code");
  const next     = searchParams.get("next") ?? "/dashboard";
  const errorParam = searchParams.get("error");

  // Handle OAuth errors from provider
  if (errorParam) {
    log.warn(FILE, "OAuth callback received error from provider", {
      error: errorParam,
      description: searchParams.get("error_description") ?? "",
    });
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  if (!code) {
    log.warn(FILE, "OAuth callback missing code param");
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  // Validate next is a safe internal path (prevent open redirect)
  const safePath =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      log.error(FILE, "Code exchange failed", error);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    log.info(FILE, "OAuth code exchanged successfully");
    return NextResponse.redirect(`${origin}${safePath}`);
  } catch (err) {
    log.error(FILE, "Unexpected error in auth callback", err);
    return NextResponse.redirect(`${origin}/login?error=unexpected`);
  }
}
