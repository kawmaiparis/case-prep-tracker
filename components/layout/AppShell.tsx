"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./SidebarNav";

const HIDDEN_ON = ["/login", "/gate", "/about"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
    setMounted(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });
  }, []);

  const hideSidebar = HIDDEN_ON.some((p) => pathname === p) || pathname.startsWith("/auth");

  // Sidebar offset only applies on md+ (desktop). On mobile the sidebar is
  // hidden and the bottom tab bar is used instead — no left padding needed.
  const offsetClass = !hideSidebar && mounted
    ? collapsed ? "md:pl-14" : "md:pl-52"
    : "";

  return (
    <>
      <SidebarNav
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />
      <div className={cn("transition-[padding-left] duration-200", offsetClass)}>
        {/* bottom padding on mobile clears the fixed tab bar */}
        <main className={hideSidebar ? "" : "pb-16 md:pb-0"}>
          {children}
        </main>
      </div>
    </>
  );
}
