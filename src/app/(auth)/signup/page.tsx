"use client";

import { useState, useTransition }          from "react";
import Link                                  from "next/link";
import { useRouter }                         from "next/navigation";
import { Button }                            from "@/components/ui/button";
import { Input }                             from "@/components/ui/input";
import { signUp, signInWithGoogle }          from "@/actions/auth";
import { Mail, Lock, User, Loader2, Chrome, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep]          = useState<"form" | "verify">("form");
  const [error, setError]        = useState<string | null>(null);
  const [isPending, startTransition]       = useTransition();
  const [isGooglePending, startGoogle]     = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signUp(formData);
      if (result.success) {
        setStep("verify");
      } else {
        setError(result.error);
      }
    });
  }

  function handleGoogle() {
    setError(null);
    startGoogle(async () => {
      const result = await signInWithGoogle("/dashboard");
      if (result.success) {
        window.location.href = result.data.url;
      } else {
        setError(result.error);
      }
    });
  }

  if (step === "verify") {
    return (
      <div className="w-full max-w-md text-center">
        <div className="rounded-2xl border border-white/8 bg-gray-900/50 p-8">
          <div className="flex justify-center mb-5">
            <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Check your email</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            We sent a confirmation link to your email address.
            <br />
            Click the link to activate your account and sign in.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-6"
            onClick={() => router.push("/login")}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">Create your account</h1>
        <p className="text-gray-400">Start closing more clients today — it&apos;s free</p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-gray-900/50 backdrop-blur-sm p-6 sm:p-8 space-y-5">
        {/* Google OAuth */}
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={handleGoogle}
          disabled={isGooglePending || isPending}
        >
          {isGooglePending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="h-4 w-4" />
          )}
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-xs text-gray-600 uppercase tracking-wider">or</span>
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
            <div className="rounded-xl border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending || isGooglePending}
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
            ) : (
              "Create Account — Free"
            )}
          </Button>

          <p className="text-center text-xs text-gray-600">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-gray-500 hover:text-gray-300 underline">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 underline">Privacy Policy</Link>
          </p>
        </form>
      </div>

      <p className="text-center mt-6 text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
