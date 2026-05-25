/**
 * /history — Past proposals & replies
 * Server component: fetches user's history from DB.
 */

import { redirect }     from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, truncate } from "@/lib/utils";
import { HistoryCopyButton } from "./HistoryCopyButton";
import { FileText, MessageSquare, Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Proposal, ClientReply } from "@/types";

export const metadata = { title: "History — FreelancerOS" };

// ── Style badge colours ───────────────────────────────────────
const STYLE_COLOR = {
  concise:   "bg-blue-500/15 text-blue-400",
  technical: "bg-purple-500/15 text-purple-400",
  premium:   "bg-amber-500/15 text-amber-400",
  agency:    "bg-emerald-500/15 text-emerald-400",
};

const STATUS_COLOR = {
  draft:    "bg-gray-700/50 text-gray-400",
  sent:     "bg-blue-500/15 text-blue-400",
  replied:  "bg-indigo-500/15 text-indigo-400",
  won:      "bg-green-500/15 text-green-400",
  lost:     "bg-red-500/15 text-red-400",
  archived: "bg-gray-600/20 text-gray-500",
};

const REPLY_TYPE_COLOR = {
  lowball:     "bg-red-500/15 text-red-400",
  followup:    "bg-blue-500/15 text-blue-400",
  negotiation: "bg-amber-500/15 text-amber-400",
  delay:       "bg-orange-500/15 text-orange-400",
  upsell:      "bg-emerald-500/15 text-emerald-400",
  general:     "bg-gray-600/20 text-gray-400",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch last 50 proposals + last 30 replies in parallel
  const [{ data: proposals }, { data: replies }] = await Promise.all([
    supabase
      .from("proposals")
      .select("id, job_post, generated_text, style, platform, status, tokens_output, generation_ms, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("client_replies")
      .select("id, client_message, generated_reply, reply_type, tokens_output, generation_ms, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const totalProposals = proposals?.length ?? 0;
  const totalReplies   = replies?.length   ?? 0;
  const isEmpty        = totalProposals === 0 && totalReplies === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">History</h1>
          <p className="text-gray-400 mt-1">All your past proposals and replies</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FileText    className="h-3.5 w-3.5" /> {totalProposals} proposals
          </span>
          <span className="text-gray-700">·</span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" /> {totalReplies} replies
          </span>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="rounded-2xl border border-white/5 bg-gray-900/40 p-16 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gray-800/60 flex items-center justify-center mb-4">
            <Clock className="h-7 w-7 text-gray-600" />
          </div>
          <h3 className="text-white font-semibold mb-2">Nothing here yet</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Generate your first proposal or reply — everything you create is saved here automatically.
          </p>
        </div>
      )}

      {/* Proposals section */}
      {totalProposals > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
            <FileText className="h-4 w-4" /> Proposals
          </h2>

          <div className="space-y-3">
            {(proposals as Proposal[]).map((p) => {
              const wordCount = p.generated_text.split(/\s+/).filter(Boolean).length;
              const excerpt   = truncate(p.generated_text, 160);
              const jobSnip   = truncate(p.job_post, 80);

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-white/5 bg-gray-900/40 p-5 hover:border-white/8 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Job excerpt */}
                      <p className="text-xs text-gray-600 mb-1.5 truncate">
                        📋 {jobSnip}
                      </p>
                      {/* Proposal excerpt */}
                      <p className="text-sm text-gray-300 leading-relaxed">{excerpt}</p>
                    </div>

                    <HistoryCopyButton text={p.generated_text} />
                  </div>

                  {/* Badges + meta */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      STYLE_COLOR[p.style]
                    )}>
                      {p.style}
                    </span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      STATUS_COLOR[p.status]
                    )}>
                      {p.status}
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-xs bg-gray-800/60 text-gray-500 capitalize">
                      {p.platform}
                    </span>
                    <span className="ml-auto text-xs text-gray-600 tabular-nums">
                      {wordCount} words · {formatDate(p.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Replies section */}
      {totalReplies > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Replies
          </h2>

          <div className="space-y-3">
            {(replies as ClientReply[]).map((r) => {
              const wordCount = r.generated_reply.split(/\s+/).filter(Boolean).length;
              const excerpt   = truncate(r.generated_reply, 160);

              return (
                <div
                  key={r.id}
                  className="rounded-2xl border border-white/5 bg-gray-900/40 p-5 hover:border-white/8 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 mb-1.5 truncate">
                        💬 {truncate(r.client_message, 80)}
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">{excerpt}</p>
                    </div>
                    <HistoryCopyButton text={r.generated_reply} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      REPLY_TYPE_COLOR[r.reply_type]
                    )}>
                      {r.reply_type}
                    </span>
                    <span className="ml-auto text-xs text-gray-600 tabular-nums">
                      {wordCount} words · {formatDate(r.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
