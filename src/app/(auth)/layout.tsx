import { Zap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-indigo-600/8 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex h-16 items-center justify-center border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 group-hover:bg-indigo-500 transition-colors">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Freelancer<span className="text-indigo-400">OS</span>
          </span>
        </Link>
      </header>

      {/* Page content */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} FreelancerOS · All rights reserved
        </p>
      </footer>
    </div>
  );
}
