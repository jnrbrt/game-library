import { useEffect, useRef, useState } from "react";

import type { AuthUser } from "../../api/auth";
import type { MediaItem, MediaStatus, MediaType } from "../../api/media";
import {
  createMediaFolder,
  deleteMediaFolder,
  updateMediaFolder,
  type MediaFolder,
} from "../../api/media-folders";

import FolderTree from "../folders/FolderTree";
import LibrarySwitcher from "./LibrarySwitcher";

interface MediaSidebarProps {
  user: AuthUser | null;
  folders: MediaFolder[];
  allMedia: MediaItem[];
  selectedFolderId: string | null;
  selectedStatus: MediaStatus | null;
  onFolderSelect: (folderId: string | null) => void;
  onFolderCreated: (folder: MediaFolder) => void;
  onFolderUpdated: (folder: MediaFolder) => void;
  onFolderDeleted: (folderId: string) => void;
  onStatusSelect: (status: MediaStatus | null) => void;
  onFolderDrop: (folderId: string, sourceFolderId: string) => void;
  onFolderDropToRoot: (sourceFolderId: string) => void;
  onMediaDrop?: (folderId: string, mediaId: string) => void;
  onLogout: () => Promise<void>;
}

const DEFAULT_SIDEBAR_WIDTH = 256;
// Share sidebar width between Games and Media.
const SIDEBAR_WIDTH_STORAGE_KEY = "game-library-sidebar-width";

const STATUSES: { value: MediaStatus; label: string }[] = [
  { value: "finished", label: "Finished" },
  { value: "ongoing", label: "Ongoing" },
  { value: "paused", label: "Paused" },
  { value: "dropped", label: "Dropped" },
  { value: "waiting-list", label: "Waiting List" },
];

const MEDIA_TYPES: {
  value: MediaType;
  label: string;
  color: string;
}[] = [
  { value: "movie", label: "Movie", color: "bg-[#800020]" },
  { value: "series", label: "Show", color: "bg-[#228B22]" },
  { value: "book", label: "Book", color: "bg-[#1E3A5F]" },
];

function getMaxSidebarWidth() {
  return Math.max(DEFAULT_SIDEBAR_WIDTH, window.innerWidth * 0.35);
}

function clampSidebarWidth(width: number) {
  return Math.min(Math.max(width, DEFAULT_SIDEBAR_WIDTH), getMaxSidebarWidth());
}

function MediaSidebar({
  user,
  folders,
  allMedia,
  selectedFolderId,
  selectedStatus,
  onFolderSelect,
  onFolderCreated,
  onFolderUpdated,
  onFolderDeleted,
  onStatusSelect,
  onFolderDrop,
  onFolderDropToRoot,
  onMediaDrop,
  onLogout,
}: MediaSidebarProps) {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isSavingFolder, setIsSavingFolder] = useState(false);
  const [actionFolder, setActionFolder] = useState<MediaFolder | null>(null);
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [isSavingRename, setIsSavingRename] = useState(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [confirmDeleteFolder, setConfirmDeleteFolder] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const storedWidth = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);

    if (!storedWidth) {
      return DEFAULT_SIDEBAR_WIDTH;
    }

    const parsedWidth = Number(storedWidth);

    if (!Number.isFinite(parsedWidth)) {
      return DEFAULT_SIDEBAR_WIDTH;
    }

    return clampSidebarWidth(parsedWidth);
  });

  const resizeStartRef = useRef<{
    startX: number;
    startWidth: number;
  } | null>(null);

  const statusCounts: Record<MediaStatus, number> = {
    finished: 0,
    ongoing: 0,
    paused: 0,
    dropped: 0,
    "waiting-list": 0,
  };

  const typeCounts: Record<MediaType, number> = {
    movie: 0,
    series: 0,
    book: 0,
  };

  for (const item of allMedia) {
    statusCounts[item.status] += 1;
    typeCounts[item.type] += 1;
  }

  const typeDistribution = MEDIA_TYPES.map((item) => ({
    ...item,
    count: typeCounts[item.value],
  })).filter((item) => item.count > 0);

  const totalTypes = allMedia.length;

  useEffect(() => {
    localStorage.setItem(
      SIDEBAR_WIDTH_STORAGE_KEY,
      String(Math.round(sidebarWidth)),
    );
  }, [sidebarWidth]);

  useEffect(() => {
    const handleWindowResize = () => {
      setSidebarWidth((currentWidth) => {
        const nextWidth = clampSidebarWidth(currentWidth);
        return nextWidth === currentWidth ? currentWidth : nextWidth;
      });
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!resizeStartRef.current) {
        return;
      }

      const { startX, startWidth } = resizeStartRef.current;
      setSidebarWidth(clampSidebarWidth(startWidth + event.clientX - startX));
    };

    const handlePointerUp = () => {
      resizeStartRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isSidebarOpen) {
      return;
    }

    resizeStartRef.current = {
      startX: event.clientX,
      startWidth: sidebarWidth,
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  };

  const closeFolderActions = () => {
    setActionFolder(null);
    setIsRenamingFolder(false);
    setRenameFolderName("");
    setConfirmDeleteFolder(false);
  };

  const handleRenameFolder = async () => {
    if (!actionFolder || !renameFolderName.trim() || isSavingRename) {
      return;
    }

    setIsSavingRename(true);

    try {
      const updatedFolder = await updateMediaFolder(actionFolder.id, {
        name: renameFolderName.trim(),
      });

      // The PATCH endpoint returns a folder without the calculated gameCount.
      onFolderUpdated({
        ...updatedFolder,
        gameCount: actionFolder.gameCount,
      });
      closeFolderActions();
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
      await deleteMediaFolder(actionFolder.id);
      onFolderDeleted(actionFolder.id);
      closeFolderActions();
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
      const folder = await createMediaFolder({
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
      className={`relative hidden shrink-0 border-r border-gray-800 bg-gray-900 md:flex md:flex-col ${
        isSidebarOpen ? "" : "w-12"
      }`}
      style={isSidebarOpen ? { width: `${sidebarWidth}px` } : undefined}
    >
      {isSidebarOpen ? (
        <>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <LibrarySwitcher />

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="shrink-0 px-3 py-2 text-lg text-gray-500 transition hover:bg-gray-800 hover:text-white"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                ‹
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-auto px-6 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => {
                onFolderSelect(null);
                onStatusSelect(null);
              }}
              className={`mb-4 flex w-full items-center justify-between px-2 py-2 text-left text-sm font-medium transition ${
                selectedFolderId === null && selectedStatus === null
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>Library</span>
              <span className="shrink-0 text-xs text-gray-500">
                {allMedia.length}
              </span>
            </button>

            <div className="mb-5">
              <div className="mb-2 px-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </span>
              </div>

              <div className="space-y-1">
                {STATUSES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      onFolderSelect(null);
                      onStatusSelect(value);
                    }}
                    className={`flex w-full items-center justify-between px-2 py-1.5 text-left text-sm transition ${
                      selectedStatus === value
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <span>{label}</span>
                    <span className="shrink-0 text-xs text-gray-500">
                      {statusCounts[value]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between gap-2 px-2">
              <span className="min-w-0 truncate text-xs font-semibold uppercase tracking-wider text-gray-500">
                Folders
              </span>

              {!isCreatingFolder && (
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(true)}
                  className="shrink-0 px-2 py-1 text-lg leading-none text-gray-500 transition hover:bg-gray-800 hover:text-white"
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
                closeFolderActions();
                setActionFolder(folder);
              }}
              onFolderActionsClose={closeFolderActions}
              actionFolderId={actionFolder?.id ?? null}
              onFolderRename={(folder) => {
                setActionFolder(folder);
                setRenameFolderName(folder.name);
                setIsRenamingFolder(true);
                setConfirmDeleteFolder(false);
              }}
              isRenamingFolder={isRenamingFolder}
              renameFolderName={renameFolderName}
              onRenameFolderNameChange={setRenameFolderName}
              onRenameSave={() => void handleRenameFolder()}
              onFolderDelete={() => void handleDeleteFolder()}
              confirmDeleteFolder={confirmDeleteFolder}
              onDeleteRequest={() => setConfirmDeleteFolder(true)}
              onDeleteCancel={() => setConfirmDeleteFolder(false)}
              isDeletingFolder={isDeletingFolder}
              onGameDrop={() => {}}
              onMediaDrop={onMediaDrop}
              onFolderDrop={onFolderDrop}
              onFolderDropToRoot={onFolderDropToRoot}
            />
          </nav>

          <div className="border-t border-gray-800 px-4 pb-4 pt-5">
            {typeDistribution.length > 0 && (
              <>
                <div className="mb-2 px-1">
                  <span className="text-[10px] font-semibold tracking-[0.18em] text-gray-600">
                    Type Distribution
                  </span>
                </div>

                <div className="mx-1 mb-2 flex h-6 overflow-hidden border border-black bg-gray-800">
                  {typeDistribution.map((item) => (
                    <div
                      key={item.value}
                      className={`${item.color} flex items-center justify-center`}
                      style={{ width: `${(item.count / totalTypes) * 100}%` }}
                      title={`${item.label}: ${item.count}`}
                    >
                      <span className="text-xs font-bold leading-none text-white">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
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

          <div
            role="separator"
            aria-label="Resize sidebar"
            aria-orientation="vertical"
            onPointerDown={handleResizeStart}
            className="absolute inset-y-0 right-0 z-20 w-1 cursor-ew-resize bg-transparent transition hover:bg-gray-700/70"
          />
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

export default MediaSidebar;
