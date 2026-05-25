import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">Welcome back</h1>
        <p className="text-gray-400">Sign in to your FreelancerOS account</p>
      </div>
      {/* Suspense required for useSearchParams in Next.js 15 */}
      <Suspense fallback={
        <div className="rounded-2xl border border-white/8 bg-gray-900/50 p-8 text-center text-gray-500 text-sm">
          Loading…
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
