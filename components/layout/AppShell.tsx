"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
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

  return (
    <>
      <SidebarNav
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />
      <div
        className="transition-[padding-left] duration-200"
        style={
          !hideSidebar && mounted
            ? { paddingLeft: collapsed ? "3.5rem" : "13rem" }
            : undefined
        }
      >
        {/* top padding on mobile to clear the hamburger button */}
        <main className={hideSidebar ? "" : "pt-14 md:pt-0"}>
          {children}
        </main>
      </div>
    </>
  );
}
