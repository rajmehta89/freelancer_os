"use client";

import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Dip your toes in. No credit card.",
    features: [
      "5 AI proposals / month",
      "3 smart replies / month",
      "Basic templates",
      "Project estimator (3/month)",
      "Email support",
    ],
    notIncluded: ["CRM & pipeline", "Follow-up automation", "Analytics", "Team workspace"],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹1,499",
    period: "/month",
    description: "For freelancers serious about closing more clients.",
    features: [
      "Unlimited AI proposals",
      "Unlimited smart replies",
      "All proposal styles",
      "Unlimited project estimates",
      "Freelancer CRM",
      "Follow-up automation",
      "Proposal analytics",
      "Full template library",
      "Priority support",
    ],
    notIncluded: ["Team workspace"],
    cta: "Join Waitlist — Get Pro Early",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Agency",
    price: "₹3,999",
    period: "/month",
    description: "For agencies managing multiple freelancers.",
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "Shared template library",
      "Team analytics dashboard",
      "Client workspace",
      "Bulk proposal generation",
      "Agency-style proposal format",
      "Dedicated onboarding",
      "SLA support",
    ],
    notIncluded: [],
    cta: "Join Waitlist — Agency",
    highlighted: false,
    badge: "Best Value",
  },
];

export function PricingSection() {
  const scrollToWaitlist = () =>
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="pricing" className="bg-gray-950 py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3">
            Pricing
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Simple pricing.
            <br />
            <span className="text-gray-500">No surprises.</span>
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-xl mx-auto">
            Join the waitlist now and lock in{" "}
            <strong className="text-white">50% early bird discount</strong> for the first 3 months.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-7 transition-all duration-300",
                plan.highlighted
                  ? "border-indigo-500/50 bg-indigo-950/30 shadow-xl shadow-indigo-500/10 scale-[1.02]"
                  : "border-white/8 bg-gray-900/40 hover:border-white/15"
              )}
            >
              {/* Highlight glow */}
              {plan.highlighted && (
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />
              )}

              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant={plan.highlighted ? "indigo" : "success"} className="px-3 py-1">
                    {plan.highlighted && <Zap className="h-3 w-3" />}
                    {plan.badge}
                  </Badge>
                </div>
              )}

              {/* Plan name & price */}
              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <span className={cn(
                    "text-5xl font-black tracking-tight",
                    plan.highlighted ? "text-white" : "text-gray-200"
                  )}>
                    {plan.price}
                  </span>
                  <span className="text-gray-500 text-sm mb-2">{plan.period}</span>
                </div>
              </div>

              {/* CTA */}
              <Button
                className="w-full mb-6"
                variant={plan.highlighted ? "default" : "outline"}
                size="lg"
                onClick={scrollToWaitlist}
              >
                {plan.cta}
              </Button>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 line-through">
                    <Check className="h-4 w-4 text-gray-700 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center mt-10 text-gray-500 text-sm">
          All prices in INR · Cancel anytime · 7-day money-back guarantee on Pro & Agency
        </p>
      </div>
    </section>
  );
}
