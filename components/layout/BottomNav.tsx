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

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname.startsWith("/auth")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20 safe-area-pb">
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors",
                active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
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
