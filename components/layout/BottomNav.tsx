"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/log", label: "Log", icon: "+" },
  { href: "/sessions", label: "Sessions", icon: "≡" },
  { href: "/drills", label: "Drills", icon: "◎" },
];

const HIDDEN_ON = ["/login", "/gate", "/about"];

export function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_ON.some((p) => pathname === p) || pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-divider z-20">
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors",
                active ? "text-accent" : "text-muted hover:text-primary"
              )}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
