import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "indigo";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-gray-800 text-gray-300 border-gray-700",
    success: "bg-green-900/50 text-green-400 border-green-800",
    warning: "bg-amber-900/50 text-amber-400 border-amber-800",
    danger:  "bg-red-900/50  text-red-400  border-red-800",
    indigo:  "bg-indigo-900/50 text-indigo-300 border-indigo-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
