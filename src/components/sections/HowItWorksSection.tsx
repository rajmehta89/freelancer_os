import { ClipboardPaste, Cpu, Send } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardPaste,
    title: "Paste the Job Post",
    desc: "Drop in the Upwork job description, client message, or email. That's it — nothing else to fill.",
    detail: "Supports: Upwork posts · Client emails · LinkedIn DMs · Project briefs",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Understands & Generates",
    desc: "Our AI reads the requirements, detects client tone, budget hints, and tech stack — then builds your perfect proposal.",
    detail: "Extracts: Tech stack · Urgency · Budget signals · Client personality",
    color: "from-purple-500 to-purple-600",
  },
  {
    number: "03",
    icon: Send,
    title: "Review, Customize & Send",
    desc: "Edit in seconds, save your style, and hit send. Your CRM auto-updates. Follow-ups are scheduled.",
    detail: "Then: CRM updated · Follow-up scheduled · Analytics tracked",
    color: "from-green-500 to-green-600",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-gray-950 py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Separator line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3">
            How It Works
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            From job post to sent proposal
            <br />
            <span className="text-indigo-400">in under 60 seconds.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-green-500/30" />

          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center group">
              {/* Step number + icon */}
              <div className="relative mb-6">
                <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg shadow-black/30 group-hover:scale-105 transition-transform duration-300`}>
                  <step.icon className="h-9 w-9 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-400">{step.number}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm max-w-xs">{step.desc}</p>

              {/* Detail pill */}
              <div className="mt-4 rounded-xl border border-white/5 bg-gray-900/60 px-4 py-2">
                <p className="text-xs text-gray-500">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Time comparison */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-5 text-center">
            <p className="text-4xl font-black text-red-400">~75 min</p>
            <p className="text-gray-500 text-sm mt-1">Writing a proposal manually</p>
          </div>
          <div className="rounded-2xl border border-green-500/15 bg-green-500/5 p-5 text-center">
            <p className="text-4xl font-black text-green-400">&lt; 60 sec</p>
            <p className="text-gray-500 text-sm mt-1">With FreelancerOS</p>
          </div>
        </div>
      </div>
    </section>
  );
}
