import { redirect }    from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link            from "next/link";
import { Button }      from "@/components/ui/button";
import {
  FileText, MessageSquare, Calculator,
  ArrowRight, Sparkles, TrendingUp, Clock, Zap,
  BarChart3, Target,
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    title:   "Generate Proposal",
    desc:    "Paste a job post and get a winning proposal in seconds.",
    icon:    FileText,
    href:    "/proposal",
    gradient: "from-indigo-500/20 to-indigo-600/10",
    iconColor: "text-indigo-400",
    iconBg:  "bg-indigo-500/15 border border-indigo-500/20",
    badge:   "Most Used",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/25",
    hoverBorder: "hover:border-indigo-500/25",
  },
  {
    title:   "Write a Reply",
    desc:    "Handle lowball offers, follow-ups, and negotiations.",
    icon:    MessageSquare,
    href:    "/reply",
    gradient: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-400",
    iconBg:  "bg-purple-500/15 border border-purple-500/20",
    badge:   null,
    badgeColor: "",
    hoverBorder: "hover:border-purple-500/25",
  },
  {
    title:   "Estimate Project",
    desc:    "Get AI-powered timeline, pricing, and milestones.",
    icon:    Calculator,
    href:    "/estimator",
    gradient: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-400",
    iconBg:  "bg-emerald-500/15 border border-emerald-500/20",
    badge:   null,
    badgeColor: "",
    hoverBorder: "hover:border-emerald-500/25",
  },
] as const;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan, proposals_used, replies_used")
    .eq("id", user.id)
    .single();

  const firstName      = profile?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there";
  const plan           = profile?.plan ?? "free";
  const proposalsUsed  = profile?.proposals_used ?? 0;
  const repliesUsed    = profile?.replies_used   ?? 0;
  const proposalsLimit = plan === "free" ? 5 : null;
  const repliesLimit   = plan === "free" ? 3 : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">

      {/* ── Hero Header ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-indigo-950/60 via-gray-900/40 to-gray-950 p-6 sm:p-8">
        {/* Glow */}
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-indigo-600/15 blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-purple-600/10 blur-[50px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-medium text-indigo-300 uppercase tracking-wider">
                FreelancerOS Dashboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-gray-400 mt-1.5 text-sm">
              Ready to close more clients today?
            </p>
          </div>
          {plan === "free" && (
            <Link href="/billing" className="shrink-0">
              <Button
                size="sm"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 border-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Upgrade to Pro
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ── Usage meters (free plan) ─────────────────────────── */}
      {plan === "free" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Proposals */}
          <div className="rounded-2xl border border-white/[0.07] bg-gray-900/40 p-5 group hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Proposals</p>
                  <p className="text-xs text-gray-500">this month</p>
                </div>
              </div>
              <div className={`text-sm font-bold tabular-nums ${proposalsUsed >= 5 ? "text-red-400" : "text-white"}`}>
                {proposalsUsed} <span className="text-gray-600 font-normal">/ {proposalsLimit}</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-gray-800/80 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${proposalsUsed >= 5 ? "bg-red-500" : "bg-indigo-500"}`}
                style={{ width: `${Math.min((proposalsUsed / (proposalsLimit ?? 5)) * 100, 100)}%` }}
              />
            </div>
            {proposalsUsed >= 5 && (
              <p className="text-xs text-amber-400 mt-2.5 flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
                Limit reached —{" "}
                <Link href="/billing" className="underline underline-offset-2 hover:text-amber-300">upgrade for unlimited</Link>
              </p>
            )}
          </div>

          {/* Replies */}
          <div className="rounded-2xl border border-white/[0.07] bg-gray-900/40 p-5 group hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Replies</p>
                  <p className="text-xs text-gray-500">this month</p>
                </div>
              </div>
              <div className={`text-sm font-bold tabular-nums ${repliesUsed >= 3 ? "text-red-400" : "text-white"}`}>
                {repliesUsed} <span className="text-gray-600 font-normal">/ {repliesLimit}</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-gray-800/80 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${repliesUsed >= 3 ? "bg-red-500" : "bg-purple-500"}`}
                style={{ width: `${Math.min((repliesUsed / (repliesLimit ?? 3)) * 100, 100)}%` }}
              />
            </div>
            {repliesUsed >= 3 && (
              <p className="text-xs text-amber-400 mt-2.5 flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
                Limit reached —{" "}
                <Link href="/billing" className="underline underline-offset-2 hover:text-amber-300">upgrade for unlimited</Link>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Quick Actions ────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href} className="group block">
              <div className={`relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gray-900/40 p-5 ${action.hoverBorder} hover:bg-gray-900/60 transition-all duration-200 h-full`}>
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${action.iconBg}`}>
                      <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                    </div>
                    {action.badge && (
                      <span className={`text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${action.badgeColor}`}>
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-[15px] mb-1.5">{action.title}</h3>
                  <p className="text-gray-500 text-[13px] leading-relaxed">{action.desc}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-600 group-hover:text-indigo-400 transition-colors">
                    Open now <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Stats Strip ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Time saved per proposal", value: "~75 min",  icon: Clock,      color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
          { label: "Reply rate improvement",  value: "2.4×",     icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Proposals this month",    value: String(proposalsUsed), icon: BarChart3, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/[0.07] bg-gray-900/30 p-5 flex items-center gap-4 hover:border-white/10 transition-colors"
          >
            <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-white tabular-nums">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Empty state / CTA ────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.07] border-dashed bg-gray-900/20 p-10 text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-gray-900 border border-white/[0.08] flex items-center justify-center mb-4">
          <Sparkles className="h-5 w-5 text-gray-600" />
        </div>
        <h3 className="text-white font-semibold mb-2">Generate your first proposal</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
          Paste any job post and get a personalised, winning proposal in under 30 seconds.
        </p>
        <Link href="/proposal">
          <Button className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-4 w-4" />
            Generate First Proposal
          </Button>
        </Link>
      </div>
    </div>
  );
}
