/**
 * /settings — User settings & preferences
 * Server component: loads profile + prefs, passes to client form.
 */

import { redirect }       from "next/navigation";
import { createClient }   from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";
import type { UserProfile, UserPreferences } from "@/types";

export const metadata = { title: "Settings — FreelancerOS" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: prefs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, plan, proposals_used, replies_used, onboarded, created_at, updated_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single(),
  ]);

  if (!profile) redirect("/login");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">
          Manage your profile, AI preferences, and notifications
        </p>
      </div>

      <SettingsClient
        profile={profile as UserProfile}
        prefs={  prefs   as UserPreferences | null}
      />
    </div>
  );
}
