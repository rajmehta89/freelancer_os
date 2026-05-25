import {
  FileText, MessageSquare, Calculator, Kanban,
  Bell, BarChart3, BookOpen, Puzzle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: FileText,
    title: "AI Proposal Engine",
    desc: "Paste any job post. Get a personalized, professional proposal that matches the client's tone and requirements — in seconds.",
    badge: "Core",
    badgeVariant: "indigo" as const,
    available: true,
  },
  {
    icon: MessageSquare,
    title: "Smart Reply Assistant",
    desc: "Handle lowball offers, ghosters, and negotiators with AI-crafted replies that keep conversations moving toward a close.",
    badge: "Core",
    badgeVariant: "indigo" as const,
    available: true,
  },
  {
    icon: Calculator,
    title: "Project Estimator",
    desc: "Get AI-powered timelines, pricing, and milestone breakdowns for any project. Stop guessing, start quoting with confidence.",
    badge: "Core",
    badgeVariant: "indigo" as const,
    available: true,
  },
  {
    icon: Kanban,
    title: "Freelancer CRM",
    desc: "Track every lead from first proposal to paid invoice. Kanban pipeline, client notes, and status tracking — built for freelancers.",
    badge: "Pro",
    badgeVariant: "success" as const,
    available: true,
  },
  {
    icon: Bell,
    title: "Follow-up Automation",
    desc: "Never forget to follow up again. Set smart reminders. Send AI-drafted follow-ups at the right moment — not too soon, not too late.",
    badge: "Pro",
    badgeVariant: "success" as const,
    available: true,
  },
  {
    icon: BarChart3,
    title: "Proposal Analytics",
    desc: "See which proposals get replies, which get ignored, and what converts. Data-driven iteration on your freelance pitch.",
    badge: "Pro",
    badgeVariant: "success" as const,
    available: true,
  },
  {
    icon: BookOpen,
    title: "Template Library",
    desc: "Save your best proposals, replies, and estimates as reusable templates. Build your personal playbook over time.",
    badge: "All Plans",
    badgeVariant: "default" as const,
    available: true,
  },
  {
    icon: Puzzle,
    title: "Browser Extension",
    desc: "Generate proposals directly on Upwork without leaving the tab. One-click generation, right where you bid.",
    badge: "Coming Soon",
    badgeVariant: "warning" as const,
    available: false,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-gray-950 py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3">
            Everything You Need
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            The complete freelancer toolkit.
            <br />
            <span className="text-gray-500">All in one place.</span>
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
            Stop juggling ChatGPT tabs, spreadsheets, and sticky notes. FreelancerOS is your
            entire client-winning workflow — unified.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className={`group rounded-2xl border p-5 transition-all duration-300 ${
                f.available
                  ? "border-white/5 bg-gray-900/40 hover:border-indigo-500/30 hover:bg-gray-900/70"
                  : "border-white/5 bg-gray-900/20 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors">
                  <f.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <Badge variant={f.badgeVariant}>{f.badge}</Badge>
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
