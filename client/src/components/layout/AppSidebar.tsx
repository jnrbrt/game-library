import { useState } from "react";
import { createFolder } from "../../api/folders";
import type { AuthUser } from "../../api/auth";
import type { Folder } from "../../api/folders";
import FolderTree from "../folders/FolderTree";

interface AppSidebarProps {
  user: AuthUser | null;
  folders: Folder[];
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onFolderCreated: (folder: Folder) => void;
  onLogout: () => Promise<void>;
}

function AppSidebar({
  user,
  folders,
  selectedFolderId,
  onFolderSelect,
  onFolderCreated,
  onLogout,
}: AppSidebarProps) {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isSavingFolder, setIsSavingFolder] = useState(false);

  const handleCreateFolder = async () => {
    const name = folderName.trim();

    if (!name || isSavingFolder) {
      return;
    }

    setIsSavingFolder(true);

    try {
      const folder = await createFolder({
        name,
        parentId: null,
      });

      onFolderCreated(folder);
      setFolderName("");
      setIsCreatingFolder(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingFolder(false);
    }
  };

  const handleCancelCreate = () => {
    if (isSavingFolder) {
      return;
    }

    setFolderName("");
    setIsCreatingFolder(false);
  };

  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-800 bg-gray-900 md:flex md:flex-col">
      <div className="border-b border-gray-800 px-6 py-5">
        <h1 className="text-xl font-bold text-white">Game Library</h1>
        <p className="mt-1 text-xs text-gray-500">Personal collection</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Folders
          </span>

          {!isCreatingFolder && (
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              className="px-2 py-1 text-lg leading-none text-gray-500 transition hover:bg-gray-800 hover:text-white"
              aria-label="Create folder"
              title="Create folder"
            >
              +
            </button>
          )}
        </div>

        {isCreatingFolder && (
          <div className="mb-3 border border-gray-800 bg-gray-950 p-3">
            <input
              type="text"
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleCreateFolder();
                }

                if (event.key === "Escape") {
                  handleCancelCreate();
                }
              }}
              placeholder="Folder name"
              autoFocus
              disabled={isSavingFolder}
              className="w-full border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-gray-500"
            />

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => void handleCreateFolder()}
                disabled={!folderName.trim() || isSavingFolder}
                className="flex-1 bg-gray-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSavingFolder ? "Creating..." : "Create"}
              </button>

              <button
                type="button"
                onClick={handleCancelCreate}
                disabled={isSavingFolder}
                className="px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-800 hover:text-white disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <FolderTree
          folders={folders}
          selectedFolderId={selectedFolderId}
          onFolderSelect={onFolderSelect}
        />
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
          className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-400 transition hover:bg-gray-800 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default AppSidebar;
