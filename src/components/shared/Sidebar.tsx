"use client";

import { useState }    from "react";
import Link            from "next/link";
import { usePathname } from "next/navigation";
import { cn }          from "@/lib/utils";
import { logOut }      from "@/actions/auth";
import {
  Zap, LayoutDashboard, FileText, MessageSquare,
  Calculator, History, Kanban, CreditCard,
  Settings, LogOut, ChevronLeft, ChevronRight, Menu, X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "Proposals",  href: "/proposal",   icon: FileText        },
  { label: "Replies",    href: "/reply",       icon: MessageSquare   },
  { label: "Estimator",  href: "/estimator",  icon: Calculator      },
  { label: "History",    href: "/history",    icon: History         },
  { label: "Pipeline",   href: "/crm",        icon: Kanban          },
] as const;

const BOTTOM_ITEMS = [
  { label: "Billing",  href: "/billing",  icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings   },
] as const;

interface SidebarProps {
  userEmail?: string;
  userName?:  string;
  plan?:      "free" | "pro" | "agency";
}

const PLAN_STYLE = {
  free:   { pill: "bg-gray-700/60 text-gray-400 border border-gray-600/40",  label: "Free"   },
  pro:    { pill: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30", label: "Pro" },
  agency: { pill: "bg-purple-500/20 text-purple-300 border border-purple-500/30", label: "Agency" },
};

export function Sidebar({ userEmail, userName, plan = "free" }: SidebarProps) {
  const pathname   = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const initials = (userName ?? userEmail ?? "U")[0].toUpperCase();
  const displayName = userName ?? "Freelancer";

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300 ease-in-out",
          "border-r border-white/[0.06] bg-gray-950/80 backdrop-blur-xl",
          collapsed ? "w-[68px]" : "w-[232px]"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex h-16 items-center border-b border-white/[0.06] px-4 shrink-0",
          collapsed ? "justify-center" : "gap-2.5"
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/30">
            <Zap className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-white font-bold text-[15px] tracking-tight">
              Freelancer<span className="text-indigo-400">OS</span>
            </span>
          )}
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                  active
                    ? "bg-indigo-600/15 text-white border border-indigo-500/20 shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.06] border border-transparent"
                )}
              >
                <item.icon className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300"
                )} />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {active && !collapsed && (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-2.5 border-t border-white/[0.06] space-y-0.5 shrink-0">
          {BOTTOM_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all border border-transparent",
                  active
                    ? "bg-indigo-600/15 text-white border-indigo-500/20"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.06]"
                )}
              >
                <item.icon className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  active ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300"
                )} />
                {!collapsed && item.label}
              </Link>
            );
          })}

          {/* User card */}
          <div className={cn(
            "mt-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3",
            collapsed ? "flex justify-center" : ""
          )}>
            {!collapsed ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  {/* Avatar */}
                  <div className="relative h-8 w-8 shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-500/20">
                      {initials}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-white truncate leading-tight">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-gray-600 truncate leading-tight mt-0.5">
                      {userEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    PLAN_STYLE[plan].pill
                  )}>
                    {PLAN_STYLE[plan].label}
                  </span>
                  <form action={logOut}>
                    <button
                      type="submit"
                      title="Sign out"
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="h-3 w-3" /> Sign out
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <form action={logOut}>
                  <button
                    type="submit"
                    title="Sign out"
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-xl py-2 text-gray-700 hover:text-gray-400 hover:bg-white/[0.05] transition-all mt-0.5"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed
              ? <ChevronRight className="h-3.5 w-3.5" />
              : <ChevronLeft  className="h-3.5 w-3.5" />
            }
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Bar ──────────────────────────────────── */}
      <MobileTopBar pathname={pathname} />
    </>
  );
}

function MobileTopBar({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between px-4 bg-gray-950/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">
            Freelancer<span className="text-indigo-400">OS</span>
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-400 hover:text-white transition-colors p-1"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-gray-950/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        "md:hidden fixed top-14 left-0 right-0 z-40 bg-gray-950/98 border-b border-white/[0.06] p-3 space-y-1 transition-all duration-200",
        open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}>
        {[...NAV_ITEMS, ...BOTTOM_ITEMS].map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-indigo-600/15 text-white border border-indigo-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.06] border border-transparent"
              )}
            >
              <item.icon className={cn("h-4 w-4", active ? "text-indigo-400" : "text-gray-500")} />
              {item.label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />}
            </Link>
          );
        })}
        <form action={logOut} className="pt-1">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </form>
      </div>
    </>
  );
}
