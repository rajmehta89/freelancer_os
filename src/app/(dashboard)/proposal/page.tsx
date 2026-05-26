/**
 * /proposal — Proposal Generator page
 * Server component: loads user plan + preferences, passes to client.
 */

import { redirect }        from "next/navigation";
import { createClient }    from "@/lib/supabase/server";
import { ProposalClient }  from "./ProposalClient";
import { FileText, Sparkles } from "lucide-react";
import type { ProposalStyle, Platform } from "@/types";

export const metadata = { title: "Proposal Generator — FreelancerOS" };

export default async function ProposalPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;
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
    <div className="space-y-6 max-w-4xl">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <FileText className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Proposal Generator</h1>
            <span className="flex items-center gap-1 text-[11px] font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-0.5">
              <Sparkles className="h-3 w-3" /> AI
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Paste a job post → get a winning, personalised proposal in seconds
          </p>
        </div>
      </div>

      <ProposalClient
        plan={            (profile?.plan as "free" | "pro" | "agency") ?? "free"}
        proposalsUsed={   profile?.proposals_used ?? 0}
        defaultStyle={    (prefs?.default_proposal_style as ProposalStyle) ?? "concise"}
        defaultPlatform={ (prefs?.default_platform        as Platform)      ?? "upwork"}
      />
    </div>
  );
}
