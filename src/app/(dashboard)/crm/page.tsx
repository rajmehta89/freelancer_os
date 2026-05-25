import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Kanban, Sparkles, Users, TrendingUp, Bell } from "lucide-react";

const FEATURES = [
  { icon: Kanban,    label: "Visual Kanban pipeline — drag & drop leads"   },
  { icon: Users,    label: "Full client contact management"               },
  { icon: TrendingUp, label: "Win/loss analytics and revenue tracking"    },
  { icon: Bell,     label: "Follow-up reminders & client activity alerts" },
];

const STAGES = [
  { label: "Prospect",    count: 0, color: "bg-gray-700/50 border-gray-600/30" },
  { label: "Proposal Sent", count: 0, color: "bg-blue-500/15 border-blue-500/20" },
  { label: "Negotiating", count: 0, color: "bg-amber-500/15 border-amber-500/20" },
  { label: "Closed Won",  count: 0, color: "bg-green-500/15 border-green-500/20" },
];

export default function CRMPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Kanban className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Pipeline</h1>
              <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5">
                Pro
              </span>
            </div>
            <p className="text-gray-400 text-sm">Track leads from proposal to paid</p>
          </div>
        </div>
      </div>

      {/* Kanban preview skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STAGES.map((stage) => (
          <div
            key={stage.label}
            className={`rounded-xl border p-3 ${stage.color}`}
          >
            <p className="text-xs font-semibold text-gray-400 mb-2">{stage.label}</p>
            <div className="h-14 rounded-lg border border-white/[0.05] bg-white/[0.02] flex items-center justify-center">
              <span className="text-[10px] text-gray-700">No leads</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gray-900/30">
        <div className="absolute top-0 right-0 h-32 w-48 bg-amber-600/10 blur-[60px] pointer-events-none" />

        <div className="relative z-10 p-10 sm:p-12 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/10">
            <Kanban className="h-7 w-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Unlock your full pipeline</h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto mb-6">
            Track every lead from first contact to closed deal. Never let a hot prospect go cold again.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-7">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-gray-900/50 px-3 py-1.5">
                <Icon className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>

          <Link href="/billing">
            <Button className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-lg shadow-amber-500/20 border-0 text-white">
              <Sparkles className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
