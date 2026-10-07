import { useState } from "react";
import { createFolder, updateFolder, deleteFolder } from "../../api/folders";
import type { AuthUser } from "../../api/auth";
import type { Folder } from "../../api/folders";
import type { Game, GameStatus } from "../../api/games";
import FolderTree from "../folders/FolderTree";

interface AppSidebarProps {
  user: AuthUser | null;
  folders: Folder[];
  allGames: Game[];
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onFolderCreated: (folder: Folder) => void;
  onLogout: () => Promise<void>;
  onFolderUpdated: (folder: Folder) => void;
  onFolderDeleted: (folderId: string) => void;
  onStatusSelect: (status: GameStatus | null) => void;
  onGameDrop: (folderId: string, gameId: string) => void;
  onFolderDrop: (folderId: string, sourceFolderId: string) => void;
  onFolderDropToRoot: (sourceFolderId: string) => void;
}

function AppSidebar({
  user,
  folders,
  allGames,
  selectedFolderId,
  onFolderSelect,
  onFolderCreated,
  onFolderUpdated,
  onLogout,
  onFolderDeleted,
  onStatusSelect,
  onGameDrop,
  onFolderDrop,
  onFolderDropToRoot,
}: AppSidebarProps) {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isSavingFolder, setIsSavingFolder] = useState(false);
  const [actionFolder, setActionFolder] = useState<Folder | null>(null);
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [isSavingRename, setIsSavingRename] = useState(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [confirmDeleteFolder, setConfirmDeleteFolder] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const statusCounts = {
    finished: allGames.filter((game) => game.status === "finished").length,
    ongoing: allGames.filter((game) => game.status === "ongoing").length,
    paused: allGames.filter((game) => game.status === "paused").length,
    dropped: allGames.filter((game) => game.status === "dropped").length,
    waitingList: allGames.filter((game) => game.status === "waiting-list")
      .length,
    platinumed: allGames.filter((game) => game.status === "platinumed").length,
  };

  const platformCounts = {
    pc: allGames.filter((game) => game.platforms.includes("pc")).length,
    playstation: allGames.filter((game) =>
      game.platforms.includes("playstation"),
    ).length,
    xbox: allGames.filter((game) => game.platforms.includes("xbox")).length,
    nintendo: allGames.filter((game) => game.platforms.includes("nintendo"))
      .length,
    mobile: allGames.filter((game) => game.platforms.includes("mobile")).length,
  };

  const handleRenameFolder = async () => {
    if (!actionFolder || !renameFolderName.trim() || isSavingRename) {
      return;
    }

    setIsSavingRename(true);

    try {
      const updatedFolder = await updateFolder(actionFolder.id, {
        name: renameFolderName.trim(),
      });

      onFolderUpdated(updatedFolder);

      setActionFolder(null);
      setIsRenamingFolder(false);
      setRenameFolderName("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingRename(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!actionFolder || isDeletingFolder) {
      return;
    }

    setIsDeletingFolder(true);

    try {
      await deleteFolder(actionFolder.id);

      onFolderDeleted(actionFolder.id);
      setActionFolder(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingFolder(false);
    }
  };

  const handleCreateFolder = async () => {
    const name = folderName.trim();

    if (!name || isSavingFolder) {
      return;
    }

    setIsSavingFolder(true);

    try {
      const folder = await createFolder({
        name,
        parentId: selectedFolderId,
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
    <aside
      className={`hidden shrink-0 border-r border-gray-800 bg-gray-900 md:flex md:flex-col ${
        isSidebarOpen ? "w-64" : "w-12"
      }`}
    >
      {isSidebarOpen ? (
        <>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Game Library</h1>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="px-3 py-2 text-lg text-gray-500 transition hover:bg-gray-800 hover:text-white"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                ‹
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-auto px-6 py-4">
            <button
              type="button"
              onClick={() => {
                onFolderSelect(null);
                onStatusSelect(null);
              }}
              className={`mb-4 flex w-full items-center justify-between px-2 py-2 text-left text-sm font-medium transition ${
                selectedFolderId === null
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>Library</span>

              <span className="text-xs text-gray-500">{allGames.length}</span>
            </button>

            <div className="mb-5">
              <div className="mb-2 px-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </span>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    onFolderSelect(null);
                    onStatusSelect("finished");
                  }}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-left text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white"
                >
                  <span>Finished</span>
                  <span className="text-xs text-gray-500">
                    {statusCounts.finished}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onFolderSelect(null);
                    onStatusSelect("ongoing");
                  }}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-left text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white"
                >
                  <span>Ongoing</span>
                  <span className="text-xs text-gray-500">
                    {statusCounts.ongoing}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onFolderSelect(null);
                    onStatusSelect("paused");
                  }}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-left text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white"
                >
                  <span>Paused</span>
                  <span className="text-xs text-gray-500">
                    {statusCounts.paused}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onFolderSelect(null);
                    onStatusSelect("dropped");
                  }}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-left text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white"
                >
                  <span>Dropped</span>
                  <span className="text-xs text-gray-500">
                    {statusCounts.dropped}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onFolderSelect(null);
                    onStatusSelect("waiting-list");
                  }}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-left text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white"
                >
                  <span>Waiting List</span>
                  <span className="text-xs text-gray-500">
                    {statusCounts.waitingList}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onFolderSelect(null);
                    onStatusSelect("platinumed");
                  }}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-left text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white"
                >
                  <span>Platinumed</span>
                  <span className="text-xs text-gray-500">
                    {statusCounts.platinumed}
                  </span>
                </button>
              </div>
            </div>

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
              onFolderSelect={(folderId) => {
                onStatusSelect(null);
                onFolderSelect(folderId);
              }}
              onFolderActions={(folder) => {
                setActionFolder(folder);
              }}
              onFolderActionsClose={() => {
                setActionFolder(null);
              }}
              actionFolderId={actionFolder?.id ?? null}
              onFolderRename={(folder) => {
                setActionFolder(folder);
                setRenameFolderName(folder.name);
                setIsRenamingFolder(true);
              }}
              isRenamingFolder={isRenamingFolder}
              renameFolderName={renameFolderName}
              onRenameFolderNameChange={setRenameFolderName}
              onRenameSave={() => {
                void handleRenameFolder();
              }}
              onFolderDelete={() => {
                void handleDeleteFolder();
              }}
              confirmDeleteFolder={confirmDeleteFolder}
              onDeleteRequest={() => {
                setConfirmDeleteFolder(true);
              }}
              onDeleteCancel={() => {
                setConfirmDeleteFolder(false);
              }}
              isDeletingFolder={isDeletingFolder}
              onGameDrop={onGameDrop}
              onFolderDrop={onFolderDrop}
              onFolderDropToRoot={onFolderDropToRoot}
            />
          </nav>

          <div className="border-t border-gray-800 px-4 pb-4 pt-5">
            {(() => {
              const totalPlatforms =
                platformCounts.pc +
                platformCounts.playstation +
                platformCounts.xbox +
                platformCounts.nintendo +
                platformCounts.mobile;

              const platforms = [
                {
                  key: "pc",
                  count: platformCounts.pc,
                  color: "bg-gray-500",
                },
                {
                  key: "playstation",
                  count: platformCounts.playstation,
                  color: "bg-blue-700",
                },
                {
                  key: "xbox",
                  count: platformCounts.xbox,
                  color: "bg-green-700",
                },
                {
                  key: "nintendo",
                  count: platformCounts.nintendo,
                  color: "bg-red-500",
                },
                {
                  key: "mobile",
                  count: platformCounts.mobile,
                  color: "bg-yellow-500",
                },
              ].filter((platform) => platform.count > 0);

              if (platforms.length === 0) {
                return null;
              }

              return (
                <>
                  <div className="mb-2 px-1">
                    <span className="text-[10px] font-semibold tracking-[0.18em] text-gray-600">
                      Platform Distribution
                    </span>
                  </div>

                  <div className="mx-1 mb-2 flex h-6 overflow-hidden border border-black bg-gray-800">
                    {platforms.map((platform) => (
                      <div
                        key={platform.key}
                        className={`${platform.color} flex items-center justify-center`}
                        style={{
                          width: `${(platform.count / totalPlatforms) * 100}%`,
                        }}
                      >
                        <span className="text-xs font-bold leading-none text-white">
                          {platform.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>

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
        </>
      ) : (
        <>
          <div className="flex justify-center pt-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="px-3 py-2 text-lg text-gray-500 transition hover:bg-gray-800 hover:text-white"
              aria-label="Open sidebar"
              title="Open sidebar"
            >
              ›
            </button>
          </div>

          <div className="mt-auto flex justify-center border-t border-gray-800 p-2">
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-2 text-gray-500 transition hover:bg-gray-800 hover:text-white"
              aria-label="Sign out"
              title="Sign out"
            >
              ↪
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

export default AppSidebar;
