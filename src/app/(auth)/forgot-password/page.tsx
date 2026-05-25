"use client";

import { useState, useTransition } from "react";
import Link                         from "next/link";
import { Button }                   from "@/components/ui/button";
import { Input }                    from "@/components/ui/input";
import { forgotPassword }           from "@/actions/auth";
import { Mail, Loader2, CheckCircle2, ArrowLeft, Lock } from "lucide-react";

export default function ForgotPasswordPage() {
  const [sent, setSent]               = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await forgotPassword(formData);
      if (result.success) setSent(true);
      else setError(result.error);
    });
  }

  /* ── Success state ───────────────────────────────────────── */
  if (sent) {
    return (
      <div className="w-full max-w-[420px] text-center">
        <div className="rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-sm p-10">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <CheckCircle2 className="h-8 w-8 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3">Check your inbox</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            If that email is registered, you&apos;ll receive a password reset link shortly.
          </p>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="mt-7 text-gray-500 hover:text-white gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── Form ────────────────────────────────────────────────── */
  return (
    <div className="w-full max-w-[420px]">
      {/* Header */}
      <div className="mb-8">
        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
          <Lock className="h-5 w-5 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Forgot password?</h1>
        <p className="text-gray-400 mt-2 text-sm">
          No worries — we&apos;ll send you a reset link
        </p>
      </div>

      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            autoComplete="email"
            required
            icon={<Mail className="h-4 w-4" />}
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
            disabled={isPending}
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      </div>

      <p className="text-center mt-6 text-sm text-gray-500">
        Remember your password?{" "}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Sign in →
        </Link>
      </p>
    </div>
  );
}
