"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, TrendingUp, Clock } from "lucide-react";

export function HeroSection() {
  const scrollToWaitlist = () =>
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  const scrollToDemo = () =>
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950 pt-16">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/8 blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Top badge */}
        <div className="flex justify-center mb-6">
          <Badge variant="indigo" className="px-4 py-1.5 text-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Built for Freelance Developers &amp; Agencies
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
          Close Freelance Clients{" "}
          <span className="relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">
              Faster
            </span>
            <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/60 to-indigo-500/0" />
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-gray-400 leading-relaxed">
          AI-powered proposals, smart client replies, and project estimates —
          all in one workflow built for developers who win more on Upwork.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="xl" onClick={scrollToWaitlist}>
            Join the Waitlist — It&apos;s Free
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button size="xl" variant="secondary" onClick={scrollToDemo}>
            See How It Works
          </Button>
        </div>

        {/* Social proof micro-stats */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["S", "A", "R", "M", "K"].map((l, i) => (
                <div
                  key={i}
                  className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold border-2 border-gray-950"
                >
                  {l}
                </div>
              ))}
            </div>
            <span>
              <strong className="text-gray-300">500+</strong> freelancers waiting
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span>
              Save <strong className="text-gray-300">3–5 hrs</strong> per proposal
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span>
              <strong className="text-gray-300">2.4×</strong> higher reply rate
            </span>
          </div>
        </div>

        {/* Hero visual — dashboard mockup */}
        <div className="mt-16 mx-auto max-w-4xl">
          <div className="rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-sm shadow-2xl shadow-black/50 overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-gray-900/80">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-gray-500 font-mono">freelancer-os.app / proposal</span>
            </div>

            {/* Mock dashboard content */}
            <div className="grid grid-cols-3 gap-0 divide-x divide-white/5">
              {/* Left: Input */}
              <div className="col-span-1 p-4 text-left">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Job Post</p>
                <div className="space-y-2">
                  {["Looking for React developer...", "Budget: $500-800", "Timeline: 2 weeks", "Skills: Next.js, TypeScript"].map((t, i) => (
                    <div key={i} className="h-5 rounded bg-gray-800 text-xs text-gray-400 flex items-center px-2 truncate">
                      {t}
                    </div>
                  ))}
                </div>
                <Button size="sm" className="mt-4 w-full text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Proposal
                </Button>
              </div>

              {/* Right: Output */}
              <div className="col-span-2 p-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Generated Proposal</p>
                  <Badge variant="success">✓ Ready</Badge>
                </div>
                <div className="space-y-1.5">
                  {[
                    "Hi! I've reviewed your requirements and I'm confident I can deliver...",
                    "I've built 20+ Next.js apps with TypeScript — including [similar project]...",
                    "My timeline: 10 days with daily updates. Milestones: Design (Day 2),",
                    "Dev (Day 7), Testing & Deploy (Day 10).",
                    "Budget: $750 (includes 2 revision rounds + 30-day support).",
                    "Let's hop on a quick call to align on requirements. When works for you?",
                  ].map((line, i) => (
                    <div key={i} className={`h-5 rounded bg-gray-800/80 text-xs text-gray-300 flex items-center px-2 truncate ${i > 3 ? "opacity-50" : ""}`}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
