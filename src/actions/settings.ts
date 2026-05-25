"use server";

/**
 * Settings Server Actions — src/actions/settings.ts
 * Controller layer for saving user profile + preferences.
 *
 * Security:
 * - Auth check on every action
 * - Zod validation before any DB write
 * - Never log user content (bio, skills, etc.)
 */

import { revalidatePath } from "next/cache";
import { createClient }   from "@/lib/supabase/server";
import { settingsSchema } from "@/lib/validations";
import { log }            from "@/lib/logger";
import type { ActionResult } from "@/types";

const FILE = "actions/settings.ts";

export async function saveSettings(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  const raw = {
    fullName:             formData.get("fullName"),
    tone:                 formData.get("tone"),
    writingStyle:         formData.get("writingStyle"),
    bioSummary:           formData.get("bioSummary"),
    hourlyRate:           formData.get("hourlyRate"),
    skills:               formData.get("skills"),
    experienceYears:      formData.get("experienceYears"),
    portfolioUrl:         formData.get("portfolioUrl"),
    defaultProposalStyle: formData.get("defaultProposalStyle"),
    defaultPlatform:      formData.get("defaultPlatform"),
    emailOnFollowup:      formData.get("emailOnFollowup") === "true",
    emailOnTips:          formData.get("emailOnTips") === "true",
  };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Invalid input";
    log.warn(FILE, "Settings validation failed", { error: msg });
    return { success: false, error: msg };
  }

  const {
    fullName,
    tone,
    writingStyle,
    bioSummary,
    hourlyRate,
    skills: skillsStr,
    experienceYears,
    portfolioUrl,
    defaultProposalStyle,
    defaultPlatform,
    emailOnFollowup,
    emailOnTips,
  } = parsed.data;

  // Parse skills: comma-separated → array
  const skills = skillsStr
    ? skillsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];

  log.db(FILE, "Saving user settings", { table: "profiles", operation: "update" });

  // ── Update profile name ───────────────────────────────────
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (profileError) {
    log.error(FILE, "Profile update failed", profileError);
    return { success: false, error: "Failed to save profile" };
  }

  log.db(FILE, "Saving user preferences", { table: "user_preferences", operation: "upsert" });

  // ── Upsert preferences ────────────────────────────────────
  const { error: prefsError } = await supabase
    .from("user_preferences")
    .upsert(
      {
        id:                     user.id,
        user_id:                user.id,
        tone,
        writing_style:          writingStyle  || null,
        bio_summary:            bioSummary    || null,
        hourly_rate:            hourlyRate    ?? null,
        skills,
        experience_years:       experienceYears ?? null,
        portfolio_url:          portfolioUrl  || null,
        default_proposal_style: defaultProposalStyle,
        default_platform:       defaultPlatform,
        email_on_followup:      emailOnFollowup ?? true,
        email_on_tips:          emailOnTips     ?? true,
      },
      { onConflict: "id" }
    );

  if (prefsError) {
    log.error(FILE, "Preferences upsert failed", prefsError);
    return { success: false, error: "Failed to save preferences" };
  }

  log.info(FILE, "Settings saved successfully");

  revalidatePath("/settings");
  revalidatePath("/proposal");
  revalidatePath("/dashboard");

  return { success: true, data: undefined };
}
