"use server";

/**
 * Auth Server Actions — src/actions/auth.ts
 * Controller layer for all authentication operations.
 *
 * Security:
 * - Zod validation on every input before touching Supabase
 * - Never log passwords or tokens
 * - Session handled via HTTP-only cookies (managed by Supabase SSR)
 * - redirectTo validated to prevent open-redirect attacks
 */

import { redirect }                          from "next/navigation";
import { headers }                            from "next/headers";
import { createClient }                       from "@/lib/supabase/server";
import { signupSchema, loginSchema, forgotPasswordSchema } from "@/lib/validations";
import { log, maskEmail }                     from "@/lib/logger";
import type { ActionResult }                  from "@/types";

const FILE = "actions/auth.ts";

/** Whitelist for safe redirect targets after login */
function sanitizeRedirectTo(redirectTo: string | null): string {
  if (!redirectTo) return "/dashboard";
  // Only allow internal paths (no open redirect)
  if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) return redirectTo;
  return "/dashboard";
}

// ── Sign Up ─────────────────────────────────────────────────
export async function signUp(formData: FormData): Promise<ActionResult> {
  const raw = {
    fullName: formData.get("fullName"),
    email:    formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Invalid input";
    log.warn(FILE, "Signup validation failed", { error: msg });
    return { success: false, error: msg };
  }

  const { fullName, email, password } = parsed.data;
  const supabase = await createClient();

  log.info(FILE, "Signup attempt", { email: maskEmail(email) });

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${(await headers()).get("origin")}/auth/callback`,
    },
  });

  if (error) {
    log.error(FILE, "Signup failed", error, { email: maskEmail(email) });
    // Generic message — don't reveal if email exists
    return { success: false, error: "Could not create account. Please try again." };
  }

  log.info(FILE, "Signup success — confirmation email sent", { email: maskEmail(email) });
  return { success: true, data: undefined };
}

// ── Log In ──────────────────────────────────────────────────
export async function logIn(
  formData: FormData,
  redirectTo?: string
): Promise<ActionResult> {
  const raw = {
    email:    formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Invalid input";
    log.warn(FILE, "Login validation failed", { error: msg });
    return { success: false, error: msg };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  log.info(FILE, "Login attempt", { email: maskEmail(email) });

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    log.warn(FILE, "Login failed", {
      email: maskEmail(email),
      code: error.status,
    });
    // Generic message — don't reveal whether email exists
    return { success: false, error: "Invalid email or password." };
  }

  log.info(FILE, "Login success", { email: maskEmail(email) });

  const destination = sanitizeRedirectTo(redirectTo ?? null);
  redirect(destination);
}

// ── Google OAuth ─────────────────────────────────────────────
export async function signInWithGoogle(redirectTo?: string): Promise<ActionResult<{ url: string }>> {
  const supabase  = await createClient();
  const origin    = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;
  const safe      = sanitizeRedirectTo(redirectTo ?? null);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safe)}`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });

  if (error || !data.url) {
    log.error(FILE, "Google OAuth initiation failed", error);
    return { success: false, error: "Could not initiate Google sign-in." };
  }

  log.info(FILE, "Google OAuth redirect initiated");
  return { success: true, data: { url: data.url } };
}

// ── Forgot Password ──────────────────────────────────────────
export async function forgotPassword(formData: FormData): Promise<ActionResult> {
  const raw = { email: formData.get("email") };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid email" };
  }

  const { email } = parsed.data;
  const supabase  = await createClient();
  const origin    = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

  // Always return success — never reveal if email exists (security)
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/settings/reset-password`,
  });

  log.info(FILE, "Password reset email triggered", { email: maskEmail(email) });
  return { success: true, data: undefined };
}

// ── Log Out ──────────────────────────────────────────────────
export async function logOut(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    log.error(FILE, "Logout failed", error);
  } else {
    log.info(FILE, "User logged out");
  }

  redirect("/login");
}
