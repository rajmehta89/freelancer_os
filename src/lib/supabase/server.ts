/**
 * Supabase Server Client — src/lib/supabase/server.ts
 * Use in Server Components, Server Actions, and Route Handlers
 * Reads/writes session via HTTP-only cookies (secure, SameSite=Strict)
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
              });
            });
          } catch {
            // Called from Server Component — cookies can't be set (safe to ignore)
          }
        },
      },
    }
  );
}
