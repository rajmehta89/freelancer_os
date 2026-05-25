"use client";

import { useState }    from "react";
import Link            from "next/link";
import { usePathname } from "next/navigation";
import { cn }          from "@/lib/utils";
import { logOut }      from "@/actions/auth";
import {
  Zap, LayoutDashboard, FileText, MessageSquare,
  Calculator, History, Kanban, CreditCard,
  Settings, LogOut, ChevronLeft, ChevronRight, Menu,
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

export function Sidebar({ userEmail, userName, plan = "free" }: SidebarProps) {
  const pathname   = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const planColors = {
    free:   "bg-gray-700 text-gray-300",
    pro:    "bg-indigo-600/30 text-indigo-300",
    agency: "bg-purple-600/30 text-purple-300",
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen sticky top-0 border-r border-white/5 bg-gray-900/40 backdrop-blur-sm transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex h-16 items-center border-b border-white/5 px-4",
          collapsed ? "justify-center" : "gap-2"
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-white font-bold text-base tracking-tight">
              Freelancer<span className="text-indigo-400">OS</span>
            </span>
          )}
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                  active
                    ? "bg-indigo-600/20 text-white border border-indigo-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn(
                  "h-4.5 w-4.5 shrink-0",
                  active ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300"
                )} />
                {!collapsed && item.label}
                {active && !collapsed && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-2 space-y-0.5 border-t border-white/5">
          {BOTTOM_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group",
                  active
                    ? "bg-indigo-600/20 text-white"
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}

          {/* User info + logout */}
          <div className={cn(
            "mt-2 rounded-xl border border-white/5 bg-gray-900/60 p-3",
            collapsed ? "flex justify-center" : ""
          )}>
            {!collapsed && (
              <div className="mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(userName ?? userEmail ?? "U")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {userName ?? "Freelancer"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                </div>
                <span className={cn(
                  "mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                  planColors[plan]
                )}>
                  {plan}
                </span>
              </div>
            )}
            <form action={logOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                {!collapsed && "Sign out"}
              </button>
            </form>
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-xl p-2 text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-all mt-1"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed
              ? <ChevronRight className="h-4 w-4" />
              : <ChevronLeft  className="h-4 w-4" />
            }
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <MobileTopBar />
    </>
  );
}

function MobileTopBar() {
  const [open, setOpen] = useState(false);
  const pathname        = usePathname();

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between px-4 bg-gray-900/95 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-white font-bold text-base">
          Freelancer<span className="text-indigo-400">OS</span>
        </span>
      </div>
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-400 hover:text-white"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="absolute top-14 left-0 right-0 bg-gray-900/98 border-b border-white/5 p-3 space-y-1">
          {[...NAV_ITEMS, ...BOTTOM_ITEMS].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                pathname === item.href
                  ? "bg-indigo-600/20 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <form action={logOut} className="pt-1">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
