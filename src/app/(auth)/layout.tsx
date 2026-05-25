import Link from "next/link";
import { Zap, FileText, MessageSquare, TrendingUp } from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "AI Proposals in 30 seconds",
    desc: "Paste a job post and get a personalised, winning proposal instantly.",
  },
  {
    icon: MessageSquare,
    title: "Smart Client Replies",
    desc: "Handle lowball offers, follow-ups & negotiations like a pro.",
  },
  {
    icon: TrendingUp,
    title: "Close 3× more clients",
    desc: "Freelancers using FreelancerOS report 3× higher reply rates.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-950">

      {/* ── Left Branded Panel (hidden on mobile) ─────────────── */}
      <div className="hidden lg:flex w-[480px] shrink-0 flex-col relative overflow-hidden">
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#1e1040] to-gray-950" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-indigo-600/20 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-purple-600/15 blur-[80px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group w-fit">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <Zap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Freelancer<span className="text-indigo-400">OS</span>
            </span>
          </Link>

          {/* Hero text */}
          <div className="mt-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs text-indigo-300 font-medium">AI-Powered Freelancer OS</span>
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Close more clients,{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                10× faster
              </span>
            </h2>
            <p className="mt-4 text-gray-400 text-base leading-relaxed">
              AI-powered proposals, replies, and client management — everything a freelancer needs to win.
            </p>
          </div>

          {/* Features */}
          <div className="mt-10 space-y-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 group">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/5 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-all">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Testimonial */}
          <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-5">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-sm font-bold">
                S
              </div>
              <div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  &quot;I went from sending 10 proposals a week to closing 3 clients in my first 48 hours with FreelancerOS.&quot;
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Sarah K.</span>
                  <span className="text-xs text-gray-600">· Full-Stack Developer, Upwork Top Rated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex h-14 items-center justify-center border-b border-white/5 bg-gray-950/80 backdrop-blur-md shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-base tracking-tight">
              Freelancer<span className="text-indigo-400">OS</span>
            </span>
          </Link>
        </header>

        {/* Background decoration for form side */}
        <div className="fixed inset-0 lg:left-[480px] pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-indigo-600/5 blur-[100px]" />
        </div>

        {/* Form area */}
        <main className="relative z-10 flex flex-1 items-center justify-center p-6 py-12">
          {children}
        </main>

        <footer className="relative z-10 py-4 text-center shrink-0">
          <p className="text-xs text-gray-700">
            © {new Date().getFullYear()} FreelancerOS · All rights reserved
          </p>
        </footer>
      </div>
    </div>
  );
}
