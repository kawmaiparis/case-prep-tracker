import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "danger";
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        variant === "default" && "bg-surface-hover text-muted",
        variant === "success" && "bg-positive-bg text-positive",
        variant === "warning" && "bg-warning-bg text-warning",
        variant === "danger"  && "bg-red-500/10 text-red-400",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
