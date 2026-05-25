import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-[0.98]",
        secondary:
          "bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm",
        outline:
          "border border-gray-700 text-gray-300 hover:border-indigo-500 hover:text-white",
        ghost:
          "text-gray-400 hover:text-white hover:bg-white/5",
        destructive:
          "bg-red-600 text-white hover:bg-red-500",
        success:
          "bg-green-600 text-white hover:bg-green-500",
      },
      size: {
        sm:   "h-8  px-3 text-xs",
        md:   "h-10 px-5 text-sm",
        lg:   "h-12 px-8 text-base",
        xl:   "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
