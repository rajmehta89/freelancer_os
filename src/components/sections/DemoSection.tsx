"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const JOB_POST = `Looking for an experienced Next.js developer to build a SaaS dashboard. Must have TypeScript experience. Budget: $600-900. Timeline: 2 weeks. Should include auth, billing, and analytics.`;

const PROPOSAL = `Hi! I reviewed your project and I'm confident I can deliver exactly what you need.

I've built 15+ SaaS dashboards with Next.js + TypeScript, including auth flows (Supabase), Stripe billing, and real-time analytics — exactly your stack.

📅 Timeline: 12 days
├── Days 1-2: Architecture + design system
├── Days 3-7: Core features (auth, dashboard, billing)
├── Days 8-10: Analytics + polish
└── Days 11-12: Testing, QA, deployment

💰 Investment: $750
Includes: Auth (login/register/forgot), Stripe subscriptions, analytics dashboard, mobile-responsive, 30-day post-launch support.

I can share 2-3 live examples of similar projects I've shipped. Want to hop on a 15-min call to align on details?

Looking forward to building this with you.`;

type Tab = "concise" | "technical" | "premium";

const tabs: { id: Tab; label: string }[] = [
  { id: "concise",   label: "Concise"   },
  { id: "technical", label: "Technical" },
  { id: "premium",   label: "Premium"   },
];

export function DemoSection() {
  const [activeTab, setActiveTab] = useState<Tab>("concise");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startGeneration() {
    setIsGenerating(true);
    setGenerated(false);
    setDisplayedText("");

    let i = 0;
    intervalRef.current = setInterval(() => {
      i += 3;
      setDisplayedText(PROPOSAL.slice(0, i));
      if (i >= PROPOSAL.length) {
        clearInterval(intervalRef.current!);
        setIsGenerating(false);
        setGenerated(true);
      }
    }, 12);
  }

  function handleCopy() {
    navigator.clipboard.writeText(displayedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Clean up interval on unmount
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <section id="demo" className="bg-gray-950 py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3">
            Live Demo
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            See it in action — right now.
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-xl mx-auto">
            Hit Generate and watch FreelancerOS turn a raw job post into a winning proposal.
          </p>
        </div>

        {/* Demo card */}
        <div className="rounded-2xl border border-white/8 bg-gray-900/50 overflow-hidden shadow-2xl shadow-black/50">
          {/* Window bar */}
          <div className="flex items-center gap-2 px-5 py-3.5 bg-gray-900 border-b border-white/5">
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <div className="h-3 w-3 rounded-full bg-green-500/70" />
            <span className="ml-3 text-xs font-mono text-gray-500">
              freelancer-os.app / proposal-generator
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
            {/* Left: Input */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Job Post Input
                </label>
                <Badge variant="indigo">Upwork</Badge>
              </div>

              <div className="rounded-xl border border-white/5 bg-gray-950/60 p-4 text-sm text-gray-300 leading-relaxed min-h-[180px] font-mono">
                {JOB_POST}
              </div>

              {/* Proposal style tabs */}
              <div className="mt-5">
                <p className="text-xs text-gray-500 mb-2">Proposal Style</p>
                <div className="flex gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setGenerated(false); setDisplayedText(""); }}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                        activeTab === tab.id
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:text-white"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="mt-5 w-full"
                onClick={startGeneration}
                disabled={isGenerating}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Proposal
                  </>
                )}
              </Button>
            </div>

            {/* Right: Output */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Generated Proposal
                </label>
                {generated && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <><Check className="h-3.5 w-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" />Copy</>
                    )}
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-white/5 bg-gray-950/60 p-4 min-h-[320px] relative">
                {!displayedText && !isGenerating ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-600 text-sm text-center">
                      Hit &quot;Generate Proposal&quot; to see the magic ✨
                    </p>
                  </div>
                ) : (
                  <pre className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {displayedText}
                    {isGenerating && (
                      <span className="inline-block w-0.5 h-4 bg-indigo-400 animate-pulse ml-0.5 align-middle" />
                    )}
                  </pre>
                )}
              </div>

              {generated && (
                <div className="mt-3 flex gap-2">
                  <div className="flex-1 rounded-lg border border-green-500/15 bg-green-500/5 px-3 py-2 text-xs text-green-400 text-center">
                    ✓ Tone matched
                  </div>
                  <div className="flex-1 rounded-lg border border-blue-500/15 bg-blue-500/5 px-3 py-2 text-xs text-blue-400 text-center">
                    ✓ Stack detected
                  </div>
                  <div className="flex-1 rounded-lg border border-purple-500/15 bg-purple-500/5 px-3 py-2 text-xs text-purple-400 text-center">
                    ✓ Budget aligned
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
