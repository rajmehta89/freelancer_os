import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full rounded-xl border bg-gray-950/60 px-4 py-3 text-sm text-white placeholder-gray-600",
              "transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-red-500/60 focus:ring-red-500"
                : "border-white/8 hover:border-white/15",
              icon ? "pl-10" : "",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
