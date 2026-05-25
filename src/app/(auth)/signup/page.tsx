"use client";

import { useState, useTransition }    from "react";
import Link                            from "next/link";
import { useRouter }                   from "next/navigation";
import { Button }                      from "@/components/ui/button";
import { Input }                       from "@/components/ui/input";
import { signUp, signInWithGoogle }    from "@/actions/auth";
import { Mail, Lock, User, Loader2, Chrome, CheckCircle2, Sparkles } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep]                   = useState<"form" | "verify">("form");
  const [error, setError]                 = useState<string | null>(null);
  const [isPending, startTransition]      = useTransition();
  const [isGooglePending, startGoogle]   = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signUp(formData);
      if (result.success) setStep("verify");
      else setError(result.error);
    });
  }

  function handleGoogle() {
    setError(null);
    startGoogle(async () => {
      const result = await signInWithGoogle("/dashboard");
      if (result.success) window.location.href = result.data.url;
      else setError(result.error);
    });
  }

  /* ── Email confirm step ──────────────────────────────────── */
  if (step === "verify") {
    return (
      <div className="w-full max-w-[420px] text-center">
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-sm p-10">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-lg shadow-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3">Check your inbox</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            We sent a confirmation link to your email address.<br />
            Click it to activate your account and start closing clients.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-7 text-gray-500 hover:text-white"
            onClick={() => router.push("/login")}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  /* ── Sign-up form ────────────────────────────────────────── */
  return (
    <div className="w-full max-w-[420px]">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1 mb-4">
          <Sparkles className="h-3 w-3 text-indigo-400" />
          <span className="text-xs text-indigo-300 font-medium">Free forever — no credit card</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create your account</h1>
        <p className="text-gray-400 mt-2 text-sm">Start closing more clients today</p>
      </div>

      <div className="space-y-4">
        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isGooglePending || isPending}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/15 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGooglePending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="h-4 w-4 text-gray-300" />
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-xs text-gray-600 uppercase tracking-widest font-medium">or</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="fullName"
            type="text"
            label="Full name"
            placeholder="Alex Johnson"
            autoComplete="name"
            required
            icon={<User className="h-4 w-4" />}
          />
          <Input
            name="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            autoComplete="email"
            required
            icon={<Mail className="h-4 w-4" />}
          />
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            required
            icon={<Lock className="h-4 w-4" />}
          />

          {error && (
            <div className="rounded-xl border border-red-500/25 bg-red-900/20 px-4 py-3 text-sm text-red-400 flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all"
            disabled={isPending || isGooglePending}
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
            ) : (
              "Create Free Account →"
            )}
          </Button>

          <p className="text-center text-xs text-gray-600">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-gray-500 hover:text-gray-300 underline underline-offset-2">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 underline underline-offset-2">Privacy Policy</Link>
          </p>
        </form>
      </div>

      <p className="text-center mt-6 text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Sign in →
        </Link>
      </p>
    </div>
  );
}
