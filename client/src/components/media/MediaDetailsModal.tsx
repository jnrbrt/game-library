import { useEffect, useState } from "react";

import type { MediaItem, MediaType } from "../../api/media";

import {
  addMediaToFolder,
  getFoldersForMedia,
  removeMediaFromFolder,
  type MediaFolder,
} from "../../api/media-folders";

interface MediaDetailsModalProps {
  media: MediaItem | null;
  folders: MediaFolder[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFoldersChanged: () => void;
}

const STATUS_STYLES: Record<
  MediaItem["status"],
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
};

const TYPE_LABELS: Record<MediaType, string> = {
  movie: "Movie",
  series: "Show",
  book: "Book",
};

const formatLabel = (value: string) => {
  if (value === "sci-fi") {
    return "Sci-Fi";
  }

  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

function MediaDetailsModal({
  media,
  folders,
  onClose,
  onEdit,
  onDelete,
  onFoldersChanged,
}: MediaDetailsModalProps) {
  const [confirmDeleteMediaId, setConfirmDeleteMediaId] = useState<
    string | null
  >(null);

  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [originalFolderIds, setOriginalFolderIds] = useState<string[]>([]);
  const [loadedMediaId, setLoadedMediaId] = useState<string | null>(null);

  const [isSavingFolders, setIsSavingFolders] = useState(false);
  const [folderError, setFolderError] = useState("");

  const mediaId = media?.id ?? null;

  useEffect(() => {
    if (mediaId === null) {
      return;
    }

    let active = true;

    const loadMediaFolders = async () => {
      try {
        const mediaFolders = await getFoldersForMedia(mediaId);

        if (!active) {
          return;
        }

        const folderIds = mediaFolders.map((folder) => folder.id);

        setOriginalFolderIds(folderIds);
        setSelectedFolderIds(folderIds);
        setFolderError("");
        setLoadedMediaId(mediaId);
      } catch (error) {
        console.error(error);

        if (active) {
          setOriginalFolderIds([]);
          setSelectedFolderIds([]);
          setFolderError("Failed to load media folders.");
          setLoadedMediaId(mediaId);
        }
      }
    };

    void loadMediaFolders();

    return () => {
      active = false;
    };
  }, [mediaId]);

  const handleClose = () => {
    if (isSavingFolders) {
      return;
    }

    setConfirmDeleteMediaId(null);
    setLoadedMediaId(null);
    setFolderError("");
    onClose();
  };

  const handleSaveFolders = async () => {
    if (!media || isSavingFolders || loadedMediaId !== media.id) {
      return;
    }

    setIsSavingFolders(true);
    setFolderError("");

    try {
      const foldersToAdd = selectedFolderIds.filter(
        (folderId) => !originalFolderIds.includes(folderId),
      );

      const foldersToRemove = originalFolderIds.filter(
        (folderId) => !selectedFolderIds.includes(folderId),
      );

      for (const folderId of foldersToAdd) {
        await addMediaToFolder(folderId, media.id);
      }

      for (const folderId of foldersToRemove) {
        await removeMediaFromFolder(folderId, media.id);
      }

      setOriginalFolderIds([...selectedFolderIds]);
      onFoldersChanged();
    } catch (error) {
      console.error(error);
      setFolderError("Failed to save folders. Please try again.");
    } finally {
      setIsSavingFolders(false);
    }
  };

  if (!media) {
    return null;
  }

  const statusStyle = STATUS_STYLES[media.status];
  const foldersLoaded = loadedMediaId === media.id;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Media details"
        className="relative mx-auto w-full max-w-2xl overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl"
      >
        {/* Header */}
        <div className="relative border-b border-gray-800 px-7 py-7">
          <div
            className={`absolute inset-y-0 left-0 w-1.5 ${statusStyle.bar}`}
          />

          <div className="flex items-start justify-between gap-6 pl-3">
            <div className="min-w-0">
              <h3 className="break-words text-3xl font-bold tracking-tight text-white">
                {media.title}
              </h3>

              <p className="mt-2 text-sm font-medium text-gray-500">
                {TYPE_LABELS[media.type]}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-5">
                <span
                  className={`inline-flex items-center gap-2 text-sm font-medium ${statusStyle.text}`}
                >
                  <span className={`h-2 w-2 ${statusStyle.dot}`} />

                  {formatLabel(media.status)}
                </span>

                {media.score !== undefined && (
                  <span className="text-sm font-semibold text-gray-300">
                    ★ {media.score.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSavingFolders}
              className="shrink-0 px-3 py-2 text-xl leading-none text-gray-500 transition hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close media details"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative space-y-8 px-7 py-8">
          {/* Genres */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Genres
            </h4>

            <div className="mt-3 flex flex-wrap gap-2">
              {media.genres.map((genre) => (
                <span
                  key={genre}
                  className="border border-gray-700 bg-gray-950 px-3 py-1.5 text-sm text-gray-300"
                >
                  {formatLabel(genre)}
                </span>
              ))}
            </div>
          </section>

          {/* Description */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Description
            </h4>

            <div className="relative mt-3 overflow-hidden border border-gray-800 bg-gray-950/70 p-5">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.025] via-transparent to-transparent" />

              <p className="relative whitespace-pre-wrap text-sm leading-7 text-gray-300">
                {media.description || "No description."}
              </p>
            </div>
          </section>

          {/* Folders */}
          <section className="border border-gray-800 bg-gray-950/50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Folders
                </h4>

                <p className="mt-1 text-xs text-gray-600">
                  Organize this media into one or more folders.
                </p>
              </div>
            </div>

            {!foldersLoaded ? (
              <p className="mt-4 text-sm text-gray-500">Loading folders...</p>
            ) : folders.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No folders yet.</p>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  {folders.map((folder) => {
                    const selected = selectedFolderIds.includes(folder.id);

                    return (
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
                        disabled={isSavingFolders || Boolean(folderError)}
                        aria-pressed={selected}
                        className={`border px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          selected
                            ? "border-sky-500 bg-sky-500/10 text-sky-300"
                            : "border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        {folder.name}
                      </button>
                    );
                  })}
                </div>

                {!folderError && (
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
                )}
              </>
            )}

            {folderError && (
              <p className="mt-4 text-sm text-red-400">{folderError}</p>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="relative border-t border-gray-800 bg-gray-950/60 px-7 py-5">
          {confirmDeleteMediaId === media.id ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  Delete {media.title}?
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteMediaId(null)}
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
                onClick={() => setConfirmDeleteMediaId(media.id)}
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

export default MediaDetailsModal;
