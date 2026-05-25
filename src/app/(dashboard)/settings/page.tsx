/**
 * /settings — User settings & preferences
 * Server component: loads profile + prefs, passes to client form.
 */

import { redirect }       from "next/navigation";
import { createClient }   from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";
import { Settings } from "lucide-react";
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
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-gray-800/60 border border-white/[0.07] flex items-center justify-center shrink-0 mt-0.5">
          <Settings className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Settings</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Manage your profile, AI preferences, and notifications
          </p>
        </div>
      </div>

      <SettingsClient
        profile={profile as UserProfile}
        prefs={  prefs   as UserPreferences | null}
      />
    </div>
  );
}
