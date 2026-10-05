import type { AuthUser } from "../../api/auth";

interface AppSidebarProps {
  user: AuthUser | null;
  onLogout: () => Promise<void>;
}

function AppSidebar({ user, onLogout }: AppSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-800 bg-gray-900 md:flex md:flex-col">
      <div className="border-b border-gray-800 px-6 py-5">
        <h1 className="text-xl font-bold text-white">Game Library</h1>

        <p className="mt-1 text-xs text-gray-500">Personal collection</p>
      </div>

      <nav className="flex-1 p-4">
        <button
          type="button"
          className="w-full rounded-lg bg-gray-800 px-4 py-3 text-left text-sm font-medium text-white"
        >
          Library
        </button>
      </nav>

      <div className="border-t border-gray-800 p-4">
        <div className="mb-3 px-2">
          <p className="text-xs text-gray-500">Signed in as</p>

          <p className="mt-1 truncate text-sm font-medium text-gray-200">
            {user?.username}
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-gray-400 transition hover:bg-gray-800 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default AppSidebar;
