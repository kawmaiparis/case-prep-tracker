import { logout } from "@/lib/actions/auth";
import { ThemeToggle } from "./ThemeToggle";

type HeaderProps = {
  title: string;
  showLogout?: boolean;
};

export function Header({ title, showLogout = false }: HeaderProps) {
  return (
    <header className="bg-surface border-b border-divider sticky top-0 z-10">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="font-medium text-primary text-base">{title}</h1>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {showLogout && (
            <form action={logout}>
              <button
                type="submit"
                className="text-xs text-muted hover:text-primary transition-colors px-2 py-1"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
