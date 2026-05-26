/**
 * GET /api/health
 * Diagnostic endpoint — checks env vars & runtime.
 * Remove or lock down before going to production with real users.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    runtime:                     process.env.NODE_ENV ?? "unknown",
    NEXT_PUBLIC_SUPABASE_URL:    process.env.NEXT_PUBLIC_SUPABASE_URL
                                   ? `set (${process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 30)}...)`
                                   : "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON:   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                                   ? `set (length ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length})`
                                   : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY:   process.env.SUPABASE_SERVICE_ROLE_KEY
                                   ? `set (length ${process.env.SUPABASE_SERVICE_ROLE_KEY.length})`
                                   : "MISSING",
    OPENAI_API_KEY:              process.env.OPENAI_API_KEY
                                   ? `set (${process.env.OPENAI_API_KEY.slice(0, 7)}...)`
                                   : "MISSING",
    timestamp:                   new Date().toISOString(),
  };

  const allOk = !Object.values(checks).includes("MISSING");

  return NextResponse.json({ ok: allOk, checks }, { status: allOk ? 200 : 500 });
}
