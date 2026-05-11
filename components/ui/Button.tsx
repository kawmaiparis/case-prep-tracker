import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", size = "md", className, children, ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors rounded",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          variant === "primary" &&
            "bg-accent text-white hover:bg-accent-hover",
          variant === "secondary" &&
            "bg-surface text-primary border border-divider hover:bg-surface-hover",
          variant === "ghost" &&
            "text-muted hover:text-primary hover:bg-surface-hover",
          size === "sm" && "px-3 py-1.5 text-xs",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-5 py-2.5 text-sm w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
