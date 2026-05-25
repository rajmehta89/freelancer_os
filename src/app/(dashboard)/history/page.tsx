/**
 * /history — Past proposals & replies
 * Server component: fetches user's history from DB.
 */

import { redirect }     from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, truncate } from "@/lib/utils";
import { HistoryCopyButton } from "./HistoryCopyButton";
import { FileText, MessageSquare, Clock, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Proposal, ClientReply } from "@/types";

export const metadata = { title: "History — FreelancerOS" };

const STYLE_COLOR: Record<string, string> = {
  concise:   "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  technical: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
  premium:   "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  agency:    "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
};

const STATUS_COLOR: Record<string, string> = {
  draft:    "bg-gray-700/40 text-gray-400 border border-gray-600/30",
  sent:     "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  replied:  "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
  won:      "bg-green-500/15 text-green-400 border border-green-500/20",
  lost:     "bg-red-500/15 text-red-400 border border-red-500/20",
  archived: "bg-gray-600/20 text-gray-500 border border-gray-600/20",
};

const REPLY_TYPE_COLOR: Record<string, string> = {
  lowball:     "bg-red-500/15 text-red-400 border border-red-500/20",
  followup:    "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  negotiation: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  delay:       "bg-orange-500/15 text-orange-400 border border-orange-500/20",
  upsell:      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  general:     "bg-gray-600/20 text-gray-400 border border-gray-600/20",
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl bg-gray-800/60 border border-white/[0.07] flex items-center justify-center shrink-0">
            <History className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">History</h1>
            <p className="text-gray-400 text-sm mt-0.5">All your past proposals and replies</p>
          </div>
        </div>
        {!isEmpty && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-gray-900/40 px-3 py-1.5">
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-medium text-gray-300">{totalProposals}</span>
              <span className="text-xs text-gray-600">proposals</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-gray-900/40 px-3 py-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-medium text-gray-300">{totalReplies}</span>
              <span className="text-xs text-gray-600">replies</span>
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="rounded-2xl border border-white/[0.07] border-dashed bg-gray-900/20 p-16 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gray-900 border border-white/[0.07] flex items-center justify-center mb-4">
            <Clock className="h-7 w-7 text-gray-700" />
          </div>
          <h3 className="text-white font-semibold mb-2">Nothing here yet</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
            Generate your first proposal or reply — everything you create is saved here automatically.
          </p>
        </div>
      )}

      {/* Proposals section */}
      {totalProposals > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 pb-1">
            <div className="h-5 w-5 rounded-md bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <FileText className="h-3 w-3 text-indigo-400" />
            </div>
            <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide">
              Proposals
            </h2>
            <span className="text-[11px] text-gray-600 ml-1">({totalProposals})</span>
          </div>

          <div className="space-y-3">
            {(proposals as Proposal[]).map((p) => {
              const wordCount = p.generated_text.split(/\s+/).filter(Boolean).length;
              const excerpt   = truncate(p.generated_text, 160);
              const jobSnip   = truncate(p.job_post, 80);

              return (
                <div
                  key={p.id}
                  className="group rounded-2xl border border-white/[0.07] bg-gray-900/40 p-5 hover:border-indigo-500/20 hover:bg-gray-900/60 transition-all duration-150"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-600 mb-2 truncate flex items-center gap-1.5">
                        <span className="text-gray-700">📋</span> {jobSnip}
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">{excerpt}</p>
                    </div>
                    <HistoryCopyButton text={p.generated_text} />
                  </div>

                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", STYLE_COLOR[p.style] ?? "bg-gray-700/40 text-gray-400")}>
                      {p.style}
                    </span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", STATUS_COLOR[p.status] ?? "bg-gray-700/40 text-gray-400")}>
                      {p.status}
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-[11px] bg-gray-800/60 text-gray-500 capitalize border border-white/[0.05]">
                      {p.platform}
                    </span>
                    <span className="ml-auto text-[11px] text-gray-600 tabular-nums">
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
          <div className="flex items-center gap-2 pb-1">
            <div className="h-5 w-5 rounded-md bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
              <MessageSquare className="h-3 w-3 text-purple-400" />
            </div>
            <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide">
              Replies
            </h2>
            <span className="text-[11px] text-gray-600 ml-1">({totalReplies})</span>
          </div>

          <div className="space-y-3">
            {(replies as ClientReply[]).map((r) => {
              const wordCount = r.generated_reply.split(/\s+/).filter(Boolean).length;
              const excerpt   = truncate(r.generated_reply, 160);

              return (
                <div
                  key={r.id}
                  className="group rounded-2xl border border-white/[0.07] bg-gray-900/40 p-5 hover:border-purple-500/20 hover:bg-gray-900/60 transition-all duration-150"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-600 mb-2 truncate flex items-center gap-1.5">
                        <span className="text-gray-700">💬</span> {truncate(r.client_message, 80)}
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed">{excerpt}</p>
                    </div>
                    <HistoryCopyButton text={r.generated_reply} />
                  </div>

                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", REPLY_TYPE_COLOR[r.reply_type] ?? "bg-gray-700/40 text-gray-400")}>
                      {r.reply_type}
                    </span>
                    <span className="ml-auto text-[11px] text-gray-600 tabular-nums">
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
