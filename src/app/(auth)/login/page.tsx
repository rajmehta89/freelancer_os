import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign In — FreelancerOS" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-[420px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome back</h1>
        <p className="text-gray-400 mt-2 text-sm">
          Sign in to your FreelancerOS account
        </p>
      </div>

      <Suspense fallback={
        <div className="rounded-2xl border border-white/8 bg-gray-900/60 p-8 text-center text-gray-500 text-sm animate-pulse">
          Loading…
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
