import { redirect }    from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link            from "next/link";
import { Button }      from "@/components/ui/button";
import { Badge }       from "@/components/ui/badge";
import {
  FileText, MessageSquare, Calculator,
  ArrowRight, Sparkles, TrendingUp, Clock,
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    title:   "Generate Proposal",
    desc:    "Paste a job post and get a winning proposal in seconds.",
    icon:    FileText,
    href:    "/proposal",
    color:   "from-indigo-500 to-indigo-600",
    badge:   "Most Used",
    bVariant: "indigo" as const,
  },
  {
    title:   "Write a Reply",
    desc:    "Handle lowball offers, follow-ups, and negotiations.",
    icon:    MessageSquare,
    href:    "/reply",
    color:   "from-purple-500 to-purple-600",
    badge:   null,
    bVariant: "default" as const,
  },
  {
    title:   "Estimate Project",
    desc:    "Get AI-powered timeline, pricing, and milestones.",
    icon:    Calculator,
    href:    "/estimator",
    color:   "from-emerald-500 to-emerald-600",
    badge:   null,
    bVariant: "default" as const,
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

  const firstName = profile?.full_name?.split(" ")[0]
    ?? user.email?.split("@")[0]
    ?? "Freelancer";

  const plan          = profile?.plan ?? "free";
  const proposalsUsed = profile?.proposals_used ?? 0;
  const repliesUsed   = profile?.replies_used   ?? 0;
  const proposalsLimit = plan === "free" ? 5 : null;
  const repliesLimit   = plan === "free" ? 3 : null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
                "Good evening";

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-gray-400 mt-1">
            Ready to close more clients today?
          </p>
        </div>
        {plan === "free" && (
          <Link href="/billing">
            <Button size="sm" variant="secondary">
              <Sparkles className="h-3.5 w-3.5" />
              Upgrade to Pro
            </Button>
          </Link>
        )}
      </div>

      {/* Usage stats — only shown for free plan */}
      {plan === "free" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/5 bg-gray-900/40 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FileText className="h-4 w-4" /> Proposals this month
              </div>
              <Badge variant={proposalsUsed >= 5 ? "danger" : "indigo"}>
                {proposalsUsed} / {proposalsLimit}
              </Badge>
            </div>
            <div className="h-2 rounded-full bg-gray-800">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${Math.min((proposalsUsed / (proposalsLimit ?? 5)) * 100, 100)}%` }}
              />
            </div>
            {proposalsUsed >= 5 && (
              <p className="text-xs text-amber-400 mt-2">
                Limit reached —{" "}
                <Link href="/billing" className="underline">upgrade for unlimited</Link>
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/5 bg-gray-900/40 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MessageSquare className="h-4 w-4" /> Replies this month
              </div>
              <Badge variant={repliesUsed >= 3 ? "danger" : "success"}>
                {repliesUsed} / {repliesLimit}
              </Badge>
            </div>
            <div className="h-2 rounded-full bg-gray-800">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{ width: `${Math.min((repliesUsed / (repliesLimit ?? 3)) * 100, 100)}%` }}
              />
            </div>
            {repliesUsed >= 3 && (
              <p className="text-xs text-amber-400 mt-2">
                Limit reached —{" "}
                <Link href="/billing" className="underline">upgrade for unlimited</Link>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-300 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href} className="group">
              <div className="rounded-2xl border border-white/5 bg-gray-900/40 p-5 hover:border-white/10 hover:bg-gray-900/60 transition-all duration-200 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  {action.badge && <Badge variant={action.bVariant}>{action.badge}</Badge>}
                </div>
                <h3 className="text-white font-semibold mb-1.5">{action.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{action.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-indigo-400 group-hover:gap-2 transition-all">
                  Open <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Avg. time saved",  value: "~75 min", sub: "per proposal",  icon: Clock,       color: "text-indigo-400" },
          { label: "Reply rate boost", value: "2.4×",    sub: "vs. manual",    icon: TrendingUp,  color: "text-green-400"  },
          { label: "Proposals sent",   value: String(proposalsUsed), sub: "this month", icon: FileText, color: "text-purple-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/5 bg-gray-900/30 p-5 flex items-center gap-4"
          >
            <div className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label} · {stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state for history */}
      <div className="rounded-2xl border border-white/5 bg-gray-900/30 p-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
          <FileText className="h-6 w-6 text-gray-600" />
        </div>
        <h3 className="text-white font-semibold mb-2">No proposals yet</h3>
        <p className="text-gray-500 text-sm mb-5">
          Generate your first AI proposal — it takes less than 60 seconds.
        </p>
        <Link href="/proposal">
          <Button size="sm">
            <Sparkles className="h-4 w-4" />
            Generate First Proposal
          </Button>
        </Link>
      </div>
    </div>
  );
}
