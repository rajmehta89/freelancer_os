/**
 * /reply — Reply Assistant page
 * Server component: loads plan info, passes to client.
 */

import { redirect }      from "next/navigation";
import { createClient }  from "@/lib/supabase/server";
import { ReplyClient }   from "./ReplyClient";
import { MessageSquare, Sparkles } from "lucide-react";

export const metadata = { title: "Reply Assistant — FreelancerOS" };

export default async function ReplyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, replies_used")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <MessageSquare className="h-5 w-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Reply Assistant</h1>
            <span className="flex items-center gap-1 text-[11px] font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-full px-2.5 py-0.5">
              <Sparkles className="h-3 w-3" /> AI
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Handle lowball offers, follow-ups, and negotiations like a pro
          </p>
        </div>
      </div>

      <ReplyClient
        plan={        (profile?.plan as "free" | "pro" | "agency") ?? "free"}
        repliesUsed={ profile?.replies_used ?? 0}
      />
    </div>
  );
}
