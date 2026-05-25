"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { joinWaitlist } from "@/actions/waitlist";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const PAIN_POINTS = [
  "Proposals take too long to write",
  "Clients ghost me after seeing my proposal",
  "Getting lowballed on budget",
  "Struggling with client reply/negotiation",
  "No system to track my leads",
  "Always forgetting to follow up",
  "Can't estimate projects confidently",
  "Writing in English professionally is hard",
];

const ROLES = [
  { id: "freelancer", label: "Solo Freelancer" },
  { id: "agency",     label: "Agency Owner"    },
  { id: "both",       label: "Both"             },
] as const;

export function WaitlistSection() {
  const [selectedPains, setSelectedPains] = useState<string[]>([]);
  const [role, setRole] = useState<"freelancer" | "agency" | "both" | "">("");
  const [successPosition, setSuccessPosition] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function togglePain(pain: string) {
    setSelectedPains((prev) =>
      prev.includes(pain) ? prev.filter((p) => p !== pain) : [...prev, pain]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    selectedPains.forEach((p) => formData.append("painPoints", p));

    startTransition(async () => {
      const result = await joinWaitlist(formData);
      if (result.success) {
        setSuccessPosition(result.data.position);
      } else {
        setErrorMsg(result.error);
      }
    });
  }

  if (successPosition !== null) {
    return (
      <section id="waitlist" className="bg-gray-950 py-24 px-4">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">
            You&apos;re on the list! 🎉
          </h2>
          {successPosition > 0 && (
            <p className="text-indigo-400 text-lg font-semibold mb-3">
              You&apos;re #{successPosition} on the waitlist
            </p>
          )}
          <p className="text-gray-400 text-base leading-relaxed">
            We&apos;ll email you the moment FreelancerOS launches — plus your{" "}
            <strong className="text-white">50% early bird discount</strong> code.
            <br />
            <br />
            Tell a freelancer friend and they&apos;ll thank you forever. 🙌
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="waitlist" className="bg-gray-950 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-600/8 blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3">
            Limited Early Access
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Be first. Get{" "}
            <span className="text-indigo-400">50% off</span>.
          </h2>
          <p className="mt-4 text-gray-400 text-lg">
            Join 500+ freelancers waiting for launch. Early members get lifetime discounts
            and shape what we build.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/8 bg-gray-900/50 backdrop-blur-sm p-6 sm:p-8 space-y-7"
        >
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Your work email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/8 bg-gray-950/60 pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              I am a…
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                    role === r.id
                      ? "border-indigo-500 bg-indigo-500/15 text-white"
                      : "border-white/8 text-gray-400 hover:border-white/20 hover:text-gray-200"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {role && (
              <input type="hidden" name="role" value={role} />
            )}
          </div>

          {/* Pain points */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              What&apos;s your biggest challenge? <span className="text-gray-500">(pick all that apply)</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">This helps us build the right features first</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PAIN_POINTS.map((pain) => {
                const selected = selectedPains.includes(pain);
                return (
                  <button
                    key={pain}
                    type="button"
                    onClick={() => togglePain(pain)}
                    className={cn(
                      "text-left rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-150",
                      selected
                        ? "border-indigo-500/60 bg-indigo-500/10 text-white"
                        : "border-white/6 text-gray-400 hover:border-white/15 hover:text-gray-200"
                    )}
                  >
                    <span className={cn("mr-2", selected ? "text-indigo-400" : "text-gray-600")}>
                      {selected ? "✓" : "○"}
                    </span>
                    {pain}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3">
              {errorMsg}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="xl"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <><Loader2 className="h-5 w-5 animate-spin" />Joining Waitlist…</>
            ) : (
              <>Join the Waitlist — Free <ArrowRight className="h-5 w-5" /></>
            )}
          </Button>

          <p className="text-center text-xs text-gray-600">
            No spam. No credit card. Just a heads-up when we launch. 🔒
          </p>
        </form>
      </div>
    </section>
  );
}
