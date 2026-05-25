"use server";

/**
 * Server Action — Waitlist Submission
 * Controller layer: validates → rate checks → inserts → logs
 *
 * Security:
 * - Zod validation (server-side, always)
 * - Duplicate email handled gracefully
 * - IP hashed (never stored raw)
 * - No user content logged
 */

import { waitlistSchema } from "@/lib/validations";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { log, maskEmail } from "@/lib/logger";
import { headers } from "next/headers";
import { createHash } from "crypto";
import type { ActionResult } from "@/types";

const FILE = "actions/waitlist.ts";

/** Hash an IP address for rate limiting — raw IP never stored */
function hashIp(ip: string): string {
  return createHash("sha256").update(ip + (process.env.IP_HASH_SALT ?? "freelancer-os")).digest("hex");
}

/** Get client IP from request headers (Vercel/proxy aware) */
async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown"
  );
}

/** Rate limit: max 3 signups per IP per hour */
async function isRateLimited(ipHash: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", oneHourAgo);

  if (error) {
    log.warn(FILE, "Rate limit check failed — allowing through", { error: error.message });
    return false; // fail open (don't block on check failure)
  }

  return (count ?? 0) >= 3;
}

export async function joinWaitlist(
  formData: FormData
): Promise<ActionResult<{ position: number }>> {
  const start = Date.now();

  // ── 1. Parse raw input ──────────────────────────────────────
  const rawData = {
    email: formData.get("email"),
    painPoints: formData.getAll("painPoints"),
    role: formData.get("role") ?? undefined,
  };

  // ── 2. Validate with Zod ────────────────────────────────────
  const parsed = waitlistSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Invalid input";
    log.warn(FILE, "Waitlist validation failed", { error: firstError });
    return { success: false, error: firstError };
  }

  const { email, painPoints, role } = parsed.data;

  // ── 3. Rate limit check ─────────────────────────────────────
  const ip = await getClientIp();
  const ipHash = hashIp(ip);

  const limited = await isRateLimited(ipHash);
  if (limited) {
    log.warn(FILE, "Waitlist rate limit hit", { ipHash: ipHash.slice(0, 8) + "***" });
    return {
      success: false,
      error: "Too many requests. Please try again later.",
    };
  }

  // ── 4. Insert into DB ───────────────────────────────────────
  log.db(FILE, "Inserting waitlist entry", { table: "waitlist", operation: "insert" });

  const { data, error } = await supabaseAdmin
    .from("waitlist")
    .insert({
      email,
      pain_points: painPoints,
      role: role ?? null,
      ip_hash: ipHash,
      source: (await headers()).get("referer") ?? null,
    })
    .select("id")
    .single();

  // ── 5. Handle duplicate email ───────────────────────────────
  if (error?.code === "23505") {
    log.info(FILE, "Duplicate waitlist email attempted", {
      email: maskEmail(email),
    });
    // Don't reveal if email exists — return success-like message
    return {
      success: true,
      data: { position: 0 }, // 0 = already registered
    };
  }

  if (error || !data) {
    log.error(FILE, "Waitlist insert failed", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }

  // ── 6. Get waitlist position ────────────────────────────────
  const { count: position } = await supabaseAdmin
    .from("waitlist")
    .select("id", { count: "exact", head: true });

  const ms = Date.now() - start;
  log.info(FILE, "Waitlist signup successful", {
    email: maskEmail(email),
    role,
    painPointsCount: painPoints.length,
    position: position ?? 1,
    ms,
  });

  return {
    success: true,
    data: { position: position ?? 1 },
  };
}
