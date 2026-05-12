"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  {
    href: "/diagnostic",
    label: "Diagnostic",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M2 12l3-4 2.5 2L10 6l4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    sidebarIcon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M2 12l3-4 2.5 2L10 6l4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/sessions",
    label: "Sessions",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    sidebarIcon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/log",
    label: "Log",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    sidebarIcon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/drills",
    label: "Drills",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    sidebarIcon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const HIDDEN_ON = ["/login", "/gate", "/about"];

type SidebarNavProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

function SidebarNavItem({
  href, label, icon, active, collapsed,
}: {
  href: string; label: string; icon: React.ReactNode;
  active: boolean; collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group",
        "border-l-[3px]",
        active
          ? "bg-accent-bg text-accent border-l-accent"
          : "text-muted hover:text-primary hover:bg-surface-elevated border-l-transparent"
      )}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        <span className="absolute left-full ml-2 px-2 py-1 text-xs bg-surface-elevated text-primary rounded-md
          opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg
          border border-divider transition-opacity">
          {label}
        </span>
      )}
    </Link>
  );
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="h-px bg-divider mx-1 my-2" />;
  return (
    <p className="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-widest text-muted uppercase">
      {label}
    </p>
  );
}

export function SidebarNav({ collapsed, onToggleCollapsed }: SidebarNavProps) {
  const pathname = usePathname();

  if (HIDDEN_ON.some((p) => pathname === p) || pathname.startsWith("/auth")) {
    return null;
  }

  const analysisItems = NAV_ITEMS.slice(0, 2);
  const actionItems   = NAV_ITEMS.slice(2);

  return (
    <>
      {/* ── Desktop sidebar (md+) ───────────────────────────────────────────── */}
      <aside
        className={cn(
          "hidden md:flex flex-col fixed left-0 top-0 h-screen bg-surface border-r border-divider z-30 overflow-hidden transition-[width] duration-200",
          collapsed ? "w-14" : "w-52"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo / toggle */}
          <div className={cn(
            "flex items-center h-14 border-b border-divider shrink-0",
            collapsed ? "justify-center px-3" : "justify-between px-4"
          )}>
            {!collapsed && (
              <span className="text-sm font-semibold text-primary tracking-tight">Case Prep</span>
            )}
            <button
              onClick={onToggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="w-7 h-7 flex items-center justify-center rounded text-muted hover:text-primary hover:bg-surface-elevated transition-colors shrink-0"
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
            <SectionLabel label="Analysis" collapsed={collapsed} />
            {analysisItems.map((item) => (
              <SidebarNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.sidebarIcon}
                active={pathname === item.href || pathname.startsWith(item.href + "/")}
                collapsed={collapsed}
              />
            ))}
            <SectionLabel label="Actions" collapsed={collapsed} />
            {actionItems.map((item) => (
              <SidebarNavItem
                key={item.href}
                href={item.href}
                label={item.label === "Log" ? "Log Session" : item.label}
                icon={item.sidebarIcon}
                active={pathname === item.href || pathname.startsWith(item.href + "/")}
                collapsed={collapsed}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-divider px-2 py-3 space-y-1 shrink-0">
            <Link
              href="/about"
              title={collapsed ? "About" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors border-l-[3px]",
                pathname === "/about"
                  ? "bg-accent-bg text-accent border-l-accent"
                  : "text-muted hover:text-primary hover:bg-surface-elevated border-l-transparent"
              )}
            >
              <span className="shrink-0"><InfoIcon /></span>
              {!collapsed && <span>About</span>}
            </Link>
            <div className={cn(
              "flex items-center px-3 py-1",
              collapsed ? "justify-center" : "justify-between"
            )}>
              {!collapsed && <span className="text-xs text-muted font-medium">Paris M.</span>}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar (below md) ───────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-surface border-t border-divider flex items-stretch safe-bottom">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors",
                active ? "text-accent" : "text-muted"
              )}
            >
              {item.icon(active)}
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
        {/* Theme toggle as a fifth slot */}
        <div className="flex flex-col items-center justify-center px-3 border-l border-divider">
          <ThemeToggle />
        </div>
      </nav>
    </>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M5 11l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
