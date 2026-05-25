/**
 * Next.js Middleware — src/middleware.ts
 *
 * Runs on every matching request BEFORE the page renders.
 * Responsibilities:
 *   1. Refresh Supabase session (keeps auth tokens alive)
 *   2. Protect /dashboard/* — redirect unauthenticated users to /login
 *   3. Redirect authenticated users away from /login and /signup
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/proposal", "/reply", "/estimator", "/history", "/crm", "/billing", "/settings"];
const AUTH_PATHS      = ["/login", "/signup", "/forgot-password"];

function isProtected(pathname: string) {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isAuthPage(pathname: string) {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Set cookies on request (for downstream) and response (for client)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
            })
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() refreshes the session token if expired
  // Do NOT remove this — it keeps users logged in
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 🔒 Protected route — no user → redirect to login
  if (isProtected(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 🔓 Auth page — user already logged in → redirect to dashboard
  if (isAuthPage(pathname) && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.searchParams.delete("redirectTo");
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Run on all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
