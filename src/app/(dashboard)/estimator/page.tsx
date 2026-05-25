import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calculator, Sparkles, Clock, DollarSign, Layers } from "lucide-react";

const FEATURES = [
  { icon: DollarSign, label: "Smart pricing suggestions based on scope" },
  { icon: Clock,      label: "Realistic timeline with milestone breakdown" },
  { icon: Layers,     label: "Deliverable list generated from requirements" },
];

export default function EstimatorPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Calculator className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Project Estimator</h1>
            <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
              Coming Soon
            </span>
          </div>
          <p className="text-gray-400 text-sm">AI-powered timeline, pricing &amp; milestones</p>
        </div>
      </div>

      {/* Placeholder card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gray-900/30">
        {/* Gradient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-64 bg-emerald-600/10 blur-[60px] pointer-events-none" />

        <div className="relative z-10 p-12 sm:p-16 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
            <Calculator className="h-8 w-8 text-emerald-400" />
          </div>

          <h2 className="text-xl font-bold text-white mb-3">Estimate any project instantly</h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto mb-8">
            Describe your project requirements and get a full breakdown — timeline, milestones, pricing, and deliverables — powered by AI.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-gray-900/50 px-3 py-1.5">
                <Icon className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>

          <Link href="/billing">
            <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 border-0">
              <Sparkles className="h-4 w-4" />
              Upgrade to unlock
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
