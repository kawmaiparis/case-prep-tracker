import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  size?: "xs" | "sm" | "base";
  muted?: boolean;
};

export function Text({ size = "sm", muted = false, className, children, ...props }: TextProps) {
  return (
    <p
      className={cn(
        size === "xs" && "text-xs",
        size === "sm" && "text-sm",
        size === "base" && "text-base",
        muted ? "text-muted" : "text-primary",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}
