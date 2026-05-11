import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3" | "h4";
};

const sizeMap = {
  h1: "text-2xl font-bold",
  h2: "text-xl font-semibold",
  h3: "text-base font-semibold",
  h4: "text-sm font-medium",
};

export function Heading({ as: Tag = "h2", className, children, ...props }: HeadingProps) {
  return (
    <Tag
      className={cn("text-primary leading-snug", sizeMap[Tag], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
