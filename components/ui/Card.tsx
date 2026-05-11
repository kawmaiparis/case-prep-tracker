import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Card({ className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface border border-divider rounded-md",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-4 py-3 border-b border-divider", className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-4 py-4", className)} {...props}>
      {children}
    </div>
  );
}
