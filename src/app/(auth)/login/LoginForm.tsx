"use client";

import { useState, useTransition }    from "react";
import { useSearchParams }             from "next/navigation";
import Link                            from "next/link";
import { Button }                      from "@/components/ui/button";
import { Input }                       from "@/components/ui/input";
import { logIn, signInWithGoogle }     from "@/actions/auth";
import { Mail, Lock, Loader2, Chrome } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirectTo") ?? "/dashboard";
  const urlError     = searchParams.get("error");

  const [error, setError]                 = useState<string | null>(
    urlError === "oauth_failed" ? "Google sign-in failed. Please try again." : null
  );
  const [isPending,       startTransition] = useTransition();
  const [isGooglePending, startGoogle]    = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await logIn(formData, redirectTo);
      if (result && !result.success) setError(result.error);
    });
  }

  function handleGoogle() {
    setError(null);
    startGoogle(async () => {
      const result = await signInWithGoogle(redirectTo);
      if (result.success) {
        window.location.href = result.data.url;
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={isGooglePending || isPending}
        className="group relative w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/15 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Email/Password form */}
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
        <div className="space-y-1.5">
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            icon={<Lock className="h-4 w-4" />}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

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
            <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 pt-1">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Sign up free →
        </Link>
      </p>
    </div>
  );
}
