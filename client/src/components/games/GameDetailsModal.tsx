import { useEffect, useState } from "react";
import type { Game } from "../../api/games";
import {
  addGameToFolder,
  getFoldersForGame,
  removeGameFromFolder,
  type Folder,
} from "../../api/folders";

interface GameDetailsModalProps {
  game: Game | null;
  folders: Folder[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFoldersChanged: () => void;
}

const STATUS_STYLES: Record<
  Game["status"],
  {
    bar: string;
    dot: string;
    text: string;
  }
> = {
  finished: {
    bar: "bg-green-500",
    dot: "bg-green-500",
    text: "text-green-400",
  },
  ongoing: {
    bar: "bg-blue-500",
    dot: "bg-blue-500",
    text: "text-blue-400",
  },
  paused: {
    bar: "bg-yellow-500",
    dot: "bg-yellow-500",
    text: "text-yellow-400",
  },
  dropped: {
    bar: "bg-red-500",
    dot: "bg-red-500",
    text: "text-red-400",
  },
  "waiting-list": {
    bar: "bg-gray-500",
    dot: "bg-gray-500",
    text: "text-gray-400",
  },
  platinumed: {
    bar: "bg-sky-400",
    dot: "bg-sky-400",
    text: "text-sky-300",
  },
};

const formatLabel = (value: string) => {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

function GameDetailsModal({
  game,
  folders,
  onClose,
  onEdit,
  onDelete,
  onFoldersChanged,
}: GameDetailsModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [originalFolderIds, setOriginalFolderIds] = useState<string[]>([]);

  useEffect(() => {
    if (!game) {
      return;
    }

    const loadGameFolders = async () => {
      try {
        const gameFolders = await getFoldersForGame(game.id);

        const folderIds = gameFolders.map((folder) => folder.id);

        setOriginalFolderIds(folderIds);
        setSelectedFolderIds(folderIds);
      } catch (error) {
        console.error(error);
        setOriginalFolderIds([]);
        setSelectedFolderIds([]);
      }
    };

    void loadGameFolders();
  }, [game]);

  const [isSavingFolders, setIsSavingFolders] = useState(false);

  const handleSaveFolders = async () => {
    if (!game || isSavingFolders) {
      return;
    }

    setIsSavingFolders(true);

    try {
      const foldersToAdd = selectedFolderIds.filter(
        (folderId) => !originalFolderIds.includes(folderId),
      );

      const foldersToRemove = originalFolderIds.filter(
        (folderId) => !selectedFolderIds.includes(folderId),
      );

      for (const folderId of foldersToAdd) {
        await addGameToFolder(folderId, game.id);
      }

      for (const folderId of foldersToRemove) {
        await removeGameFromFolder(folderId, game.id);
      }

      setOriginalFolderIds(selectedFolderIds);
      onFoldersChanged();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingFolders(false);
    }
  };

  if (!game) {
    return null;
  }

  const statusStyle = STATUS_STYLES[game.status];
  const isPlatinumed = game.status === "platinumed";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`relative mx-auto w-full max-w-2xl overflow-hidden border bg-gray-900 shadow-2xl ${
          isPlatinumed
            ? "border-sky-500/40 shadow-[0_0_50px_rgba(56,189,248,0.12)]"
            : "border-gray-800"
        }`}
      >
        {isPlatinumed && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-300/[0.06] via-transparent to-blue-500/[0.025]" />
        )}

        <div className="relative border-b border-gray-800 px-7 py-7">
          <div
            className={`absolute inset-y-0 left-0 w-1.5 ${statusStyle.bar}`}
          />

          <div className="flex items-start justify-between gap-6 pl-3">
            <div className="min-w-0">
              <h3 className="text-3xl font-bold tracking-tight text-white">
                {game.name}
              </h3>

              <div className="mt-4 flex flex-wrap items-center gap-5">
                <span
                  className={`inline-flex items-center gap-2 text-sm font-medium ${statusStyle.text}`}
                >
                  <span className={`h-2 w-2 ${statusStyle.dot}`} />

                  {formatLabel(game.status)}
                </span>

                {game.rating !== undefined && (
                  <span className="text-sm font-semibold text-gray-300">
                    ★ {game.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 px-3 py-2 text-xl leading-none text-gray-500 transition hover:bg-gray-800 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="relative space-y-8 px-7 py-8">
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Genres
            </h4>

            <div className="mt-3 flex flex-wrap gap-2">
              {game.genres.map((genre) => (
                <span
                  key={genre}
                  className="border border-gray-700 bg-gray-950 px-3 py-1.5 text-sm text-gray-300"
                >
                  {formatLabel(genre)}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Platforms
            </h4>

            <div className="mt-3 flex flex-wrap gap-2">
              {game.platforms.map((platform) => (
                <span
                  key={platform}
                  className="border border-gray-700 bg-gray-950 px-3 py-1.5 text-sm text-gray-300"
                >
                  {formatLabel(platform)}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Description
            </h4>

            <div className="relative mt-3 overflow-hidden border border-gray-800 bg-gray-950/70 p-5">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.025] via-transparent to-transparent" />

              <p className="relative whitespace-pre-wrap text-sm leading-7 text-gray-300">
                {game.description || "No description."}
              </p>
            </div>
          </section>

          <section className="border border-gray-800 bg-gray-950/50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Folders
                </h4>

                <p className="mt-1 text-xs text-gray-600">
                  Organize this game into one or more folders.
                </p>
              </div>
            </div>

            {folders.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No folders yet.</p>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => {
                        setSelectedFolderIds((current) =>
                          current.includes(folder.id)
                            ? current.filter((id) => id !== folder.id)
                            : [...current, folder.id],
                        );
                      }}
                      className={`border px-3 py-1.5 text-sm transition ${
                        selectedFolderIds.includes(folder.id)
                          ? "border-sky-500 bg-sky-500/10 text-sky-300"
                          : "border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      {folder.name}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex justify-end border-t border-gray-800 pt-4">
                  <button
                    type="button"
                    onClick={() => void handleSaveFolders()}
                    disabled={isSavingFolders}
                    className="border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300 transition hover:border-sky-400 hover:bg-sky-500/20 hover:text-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSavingFolders ? "Saving..." : "Save folders"}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>

        <div className="relative border-t border-gray-800 bg-gray-950/60 px-7 py-5">
          {confirmDelete ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  Delete {game.name}?
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-gray-700 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onDelete}
                  className="border border-red-500/30 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-950/40 hover:text-red-300"
              >
                Delete
              </button>

              <button
                type="button"
                onClick={onEdit}
                className="border border-gray-700 bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-gray-700 hover:text-white"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameDetailsModal;
