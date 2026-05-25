import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, Check, Sparkles, Zap, Building2 } from "lucide-react";

const PLANS = [
  {
    id:       "free",
    name:     "Free",
    price:    "₹0",
    period:   "forever",
    desc:     "Get started for free",
    icon:     Zap,
    iconBg:   "bg-gray-700/50 border-gray-600/30",
    iconColor:"text-gray-400",
    cardStyle: "border-white/[0.07] bg-gray-900/30",
    badgeStyle: "",
    badge:    "",
    cta:      "Current plan",
    ctaStyle: "border border-white/10 bg-white/5 text-gray-400 cursor-default",
    features: [
      "5 AI proposals / month",
      "3 AI replies / month",
      "Basic styles (Concise)",
      "History — last 10 items",
    ],
    locked: [
      "Unlimited proposals & replies",
      "CRM pipeline",
      "Project estimator",
      "Priority support",
    ],
    popular: false,
  },
  {
    id:       "pro",
    name:     "Pro",
    price:    "₹999",
    period:   "/ month",
    desc:     "Everything you need to scale",
    icon:     Sparkles,
    iconBg:   "bg-indigo-500/15 border-indigo-500/25",
    iconColor:"text-indigo-400",
    cardStyle: "border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-gray-900/40 shadow-xl shadow-indigo-500/10",
    badgeStyle:"bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
    badge:    "Most Popular",
    cta:      "Upgrade to Pro",
    ctaStyle: "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/20 text-white border-0",
    features: [
      "Unlimited proposals",
      "Unlimited replies",
      "All 4 proposal styles",
      "Full history access",
      "CRM pipeline",
      "Project estimator",
      "AI personalisation",
      "Priority support",
    ],
    locked: [],
    popular: true,
  },
  {
    id:       "agency",
    name:     "Agency",
    price:    "₹2,499",
    period:   "/ month",
    desc:     "For teams & agencies",
    icon:     Building2,
    iconBg:   "bg-purple-500/15 border-purple-500/25",
    iconColor:"text-purple-400",
    cardStyle: "border-purple-500/20 bg-gray-900/30",
    badgeStyle:"",
    badge:    "",
    cta:      "Upgrade to Agency",
    ctaStyle: "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/15 text-white border-0",
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "Bulk proposal generation",
      "Team analytics dashboard",
      "White-label proposals",
      "Dedicated account manager",
    ],
    locked: [],
    popular: false,
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-gray-800/60 border border-white/[0.07] flex items-center justify-center shrink-0 mt-0.5">
          <CreditCard className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Billing</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your plan and subscription</p>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-6 flex flex-col ${plan.cardStyle} transition-all duration-200`}
          >
            {/* Popular badge */}
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className={`rounded-full px-3 py-0.5 text-xs font-semibold whitespace-nowrap ${plan.badgeStyle}`}>
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Plan icon + name */}
            <div className="flex items-center gap-3 mb-5">
              <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${plan.iconBg}`}>
                <plan.icon className={`h-5 w-5 ${plan.iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{plan.name}</p>
                <p className="text-[11px] text-gray-500">{plan.desc}</p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                <span className="text-sm text-gray-500">{plan.period}</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex-1 space-y-2.5 mb-6">
              {plan.features.map((f) => (
                <div key={f} className="flex items-start gap-2.5">
                  <div className="h-[18px] w-[18px] rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-2.5 w-2.5 text-green-400" />
                  </div>
                  <span className="text-[13px] text-gray-300">{f}</span>
                </div>
              ))}
              {plan.locked.map((f) => (
                <div key={f} className="flex items-start gap-2.5 opacity-35">
                  <div className="h-[18px] w-[18px] rounded-full border border-gray-600/40 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-600" />
                  </div>
                  <span className="text-[13px] text-gray-500 line-through">{f}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {plan.id === "free" ? (
              <div className={`w-full rounded-xl py-2.5 text-center text-sm font-medium ${plan.ctaStyle}`}>
                {plan.cta}
              </div>
            ) : (
              <Link href="#" className="block">
                <button className={`w-full rounded-xl py-2.5 text-center text-sm font-semibold transition-all ${plan.ctaStyle}`}>
                  {plan.cta}
                </button>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Payment note */}
      <div className="rounded-2xl border border-white/[0.07] bg-gray-900/20 p-5 flex items-start gap-3">
        <CreditCard className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-gray-300">Secure payments via Razorpay</p>
          <p className="text-xs text-gray-600 mt-0.5">
            All plans are billed monthly. Cancel anytime — no questions asked.
            Razorpay integration is coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
