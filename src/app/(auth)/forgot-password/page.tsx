"use client";

import { useState, useTransition } from "react";
import Link                         from "next/link";
import { Button }                   from "@/components/ui/button";
import { Input }                    from "@/components/ui/input";
import { forgotPassword }           from "@/actions/auth";
import { Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [sent, setSent]          = useState(false);
  const [error, setError]        = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await forgotPassword(formData);
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error);
      }
    });
  }

  if (sent) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="rounded-2xl border border-white/8 bg-gray-900/50 p-8">
          <div className="flex justify-center mb-5">
            <div className="h-16 w-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Check your email</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            If that email is registered, you&apos;ll receive a password reset link shortly.
          </p>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="mt-6">
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">Forgot password?</h1>
        <p className="text-gray-400">Enter your email and we&apos;ll send you a reset link</p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-gray-900/50 p-6 sm:p-8 space-y-5">
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
            <div className="rounded-xl border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
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
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
