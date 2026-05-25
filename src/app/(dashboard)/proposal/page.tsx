/**
 * /proposal — Proposal Generator page
 * Server component: loads user plan + preferences, passes to client.
 */

import { redirect }        from "next/navigation";
import { createClient }    from "@/lib/supabase/server";
import { ProposalClient }  from "./ProposalClient";
import type { ProposalStyle, Platform } from "@/types";

export const metadata = { title: "Proposal Generator — FreelancerOS" };

export default async function ProposalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: prefs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("plan, proposals_used")
      .eq("id", user.id)
      .single(),
    supabase
      .from("user_preferences")
      .select("default_proposal_style, default_platform")
      .eq("user_id", user.id)
      .single(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Proposal Generator</h1>
        <p className="text-gray-400 mt-1">
          Paste a job post → get a winning, personalised proposal in seconds
        </p>
      </div>

      <ProposalClient
        plan={             (profile?.plan as "free" | "pro" | "agency") ?? "free"}
        proposalsUsed={    profile?.proposals_used ?? 0}
        defaultStyle={     (prefs?.default_proposal_style as ProposalStyle) ?? "concise"}
        defaultPlatform={  (prefs?.default_platform        as Platform)      ?? "upwork"}
      />
    </div>
  );
}
