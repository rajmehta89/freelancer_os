import { Clock, DollarSign, Ghost, LayoutList, RefreshCw, MessageSquareX } from "lucide-react";

const problems = [
  {
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
    title: "Proposals take forever",
    desc: "You spend 45–90 minutes writing one proposal — and most get ignored. That's time you could bill.",
  },
  {
    icon: Ghost,
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
    title: "Clients ghost you",
    desc: "You craft the perfect proposal. Client reads it. Never replies. No follow-up system = lost money.",
  },
  {
    icon: DollarSign,
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
    title: "Budget lowballing",
    desc: "\"Can you do it for $200?\" — and you don't know how to push back professionally without losing the client.",
  },
  {
    icon: MessageSquareX,
    color: "text-rose-400",
    bg: "bg-rose-400/10 border-rose-400/20",
    title: "Generic replies kill conversions",
    desc: "Copy-pasted templates scream \"freelancer #47\". Clients feel it and move on to someone who sounds personal.",
  },
  {
    icon: LayoutList,
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    title: "No system to track leads",
    desc: "You have 12 tabs open, a notes app, and a spreadsheet. You still forget who replied and who didn't.",
  },
  {
    icon: RefreshCw,
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    title: "Follow-ups always fall through",
    desc: "\"I'll follow up tomorrow.\" You never do. That lead who was close to saying yes? Gone to someone who did.",
  },
];

export function ProblemSection() {
  return (
    <section className="bg-gray-950 py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3">
            Sound Familiar?
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Freelancing is hard.{" "}
            <span className="text-gray-500">Winning clients is harder.</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg">
            Every freelancer hits the same walls. You&apos;re not alone — and there&apos;s a
            better way.
          </p>
        </div>

        {/* Problem grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map((p) => (
            <div
              key={p.title}
              className="group rounded-2xl border border-white/5 bg-gray-900/40 p-6 hover:border-white/10 hover:bg-gray-900/60 transition-all duration-300"
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${p.bg} mb-4`}>
                <p.icon className={`h-5 w-5 ${p.color}`} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{p.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Transition hook */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-6 py-4">
            <span className="text-2xl">💡</span>
            <p className="text-gray-300 text-base">
              <strong className="text-white">FreelancerOS</strong> fixes all of this —{" "}
              <span className="text-indigo-400">in one workflow.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
