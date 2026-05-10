import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
        variant === "secondary" && "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300",
        variant === "ghost" && "text-gray-600 hover:bg-gray-100 active:bg-gray-200",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
