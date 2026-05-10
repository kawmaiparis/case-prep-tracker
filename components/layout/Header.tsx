import { logout } from "@/lib/actions/auth";

type HeaderProps = {
  title: string;
};

export function Header({ title }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900">{title}</h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
