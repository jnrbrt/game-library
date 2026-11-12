import { useEffect, useMemo, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";

import { logout } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import {
  createMedia,
  deleteMedia,
  getMedia,
  updateMedia,
  type MediaGenre,
  type MediaItem,
  type MediaStatus,
  type MediaType,
} from "../api/media";
import {
  addMediaToFolder,
  getMediaFolders,
  getMediaInFolder,
  removeMediaFromFolder,
  updateMediaFolder,
  type MediaFolder,
} from "../api/media-folders";

import MediaSidebar from "../components/layout/MediaSidebar";
import LibraryHeader from "../components/layout/LibraryHeader";
import MediaContent from "../components/media/MediaContent";
import MediaToolbar, {
  type MediaSortOption,
} from "../components/media/MediaToolbar";
import AddMediaModal from "../components/media/AddMediaModal";
import MediaDetailsModal from "../components/media/MediaDetailsModal";

const STATUS_LABELS: Record<MediaStatus, string> = {
  finished: "Finished",
  ongoing: "Ongoing",
  paused: "Paused",
  dropped: "Dropped",
  "waiting-list": "Waiting List",
};

const SORT_STORAGE_KEY = "media-library-sort";
const DEFAULT_SORT: MediaSortOption = "name-asc";

const isSortOption = (value: string | null): value is MediaSortOption =>
  value === "name-asc" ||
  value === "name-desc" ||
  value === "rating-desc" ||
  value === "rating-asc" ||
  value === "created-desc" ||
  value === "created-asc";

function MediaLibraryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<MediaStatus | null>(
    null,
  );
  const [folderMediaIds, setFolderMediaIds] = useState<string[]>([]);
  const [loadingFolder, setLoadingFolder] = useState(false);
  const [folderError, setFolderError] = useState("");
  const [folderRefreshVersion, setFolderRefreshVersion] = useState(0);

  // Same search / filters / sorting as Games, with Media-specific type and score.
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<MediaGenre[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<MediaType[]>([]);
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [sortOption, setSortOption] = useState<MediaSortOption>(() => {
    const saved = localStorage.getItem(SORT_STORAGE_KEY);
    return isSortOption(saved) ? saved : DEFAULT_SORT;
  });

  const [isMediaDragging, setIsMediaDragging] = useState(false);
  const [isRemoveDropActive, setIsRemoveDropActive] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "list">(() =>
    localStorage.getItem("media-library-view-mode") === "list"
      ? "list"
      : "grid",
  );

  useEffect(() => {
    localStorage.setItem("media-library-view-mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(SORT_STORAGE_KEY, sortOption);
  }, [sortOption]);

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<MediaType>("movie");
  const [genres, setGenres] = useState<MediaGenre[]>([]);
  const [status, setStatus] = useState<MediaStatus>("ongoing");
  const [score, setScore] = useState("");
  const [description, setDescription] = useState("");
  const [savingMedia, setSavingMedia] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [mediaResult, folderResult] = await Promise.allSettled([
        getMedia(),
        getMediaFolders(),
      ]);

      if (!active) {
        return;
      }

      if (mediaResult.status === "fulfilled") {
        setMedia(mediaResult.value);
        setError("");
      } else {
        console.error(mediaResult.reason);
        setError("Failed to load media.");
      }

      if (folderResult.status === "fulfilled") {
        setFolders(folderResult.value);
      } else {
        console.error(folderResult.reason);
      }

      setLoading(false);
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  // Keep a folder's visible items in sync with folder selection and changes.
  useEffect(() => {
    let active = true;

    const loadFolderMedia = async () => {
      if (selectedFolderId === null) {
        setFolderMediaIds([]);
        setLoadingFolder(false);
        setFolderError("");
        return;
      }

      setLoadingFolder(true);
      setFolderMediaIds([]);
      setFolderError("");

      try {
        const items = await getMediaInFolder(selectedFolderId);

        if (active) {
          setFolderMediaIds(items.map((item) => item.id));
        }
      } catch (err) {
        console.error(err);

        if (active) {
          setFolderError("Failed to load this folder.");
        }
      } finally {
        if (active) {
          setLoadingFolder(false);
        }
      }
    };

    void loadFolderMedia();

    return () => {
      active = false;
    };
  }, [selectedFolderId, folderRefreshVersion]);

  const visibleMedia = useMemo(() => {
    const folderIds = new Set(folderMediaIds);

    return media.filter((item) => {
      if (selectedFolderId !== null && !folderIds.has(item.id)) {
        return false;
      }

      if (selectedStatus !== null && item.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [media, folderMediaIds, selectedFolderId, selectedStatus]);

  const filteredAndSortedMedia = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    const min = minScore.trim() === "" ? undefined : Number(minScore);
    const max = maxScore.trim() === "" ? undefined : Number(maxScore);

    const filtered = visibleMedia.filter((item) => {
      if (query && !item.title.toLocaleLowerCase().includes(query)) {
        return false;
      }
      if (
        selectedGenres.length > 0 &&
        !selectedGenres.some((genre) => item.genres.includes(genre))
      ) {
        return false;
      }
      if (selectedTypes.length > 0 && !selectedTypes.includes(item.type)) {
        return false;
      }
      if (
        min !== undefined &&
        Number.isFinite(min) &&
        (item.score === undefined || item.score < min)
      ) {
        return false;
      }
      if (
        max !== undefined &&
        Number.isFinite(max) &&
        (item.score === undefined || item.score > max)
      ) {
        return false;
      }
      return true;
    });

    const byTitle = (a: MediaItem, b: MediaItem) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "base" });

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return byTitle(a, b);
        case "name-desc":
          return byTitle(b, a);
        case "rating-desc": {
          const difference = (b.score ?? -1) - (a.score ?? -1);
          return difference || byTitle(a, b);
        }
        case "rating-asc": {
          const difference = (a.score ?? 11) - (b.score ?? 11);
          return difference || byTitle(a, b);
        }
        case "created-desc": {
          const difference =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          return difference || byTitle(a, b);
        }
        case "created-asc": {
          const difference =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          return difference || byTitle(a, b);
        }
        default:
          return 0;
      }
    });
  }, [
    visibleMedia,
    searchQuery,
    selectedGenres,
    selectedTypes,
    minScore,
    maxScore,
    sortOption,
  ]);

  // Use the same breadcrumb structure as the Game Library header.
  const breadcrumbs = useMemo(() => {
    if (selectedStatus !== null) {
      return [{ id: null, name: STATUS_LABELS[selectedStatus] }];
    }

    if (selectedFolderId === null) {
      return [{ id: null, name: "Library" }];
    }

    const path: { id: string | null; name: string }[] = [];
    let currentFolderId: string | null = selectedFolderId;

    while (currentFolderId !== null) {
      const folder = folders.find((item) => item.id === currentFolderId);

      if (!folder) {
        break;
      }

      path.unshift({ id: folder.id, name: folder.name });
      currentFolderId = folder.parentId;
    }

    return path.length > 0 ? path : [{ id: null, name: "Library" }];
  }, [folders, selectedFolderId, selectedStatus]);

  const refreshFolders = async () => {
    try {
      setFolders(await getMediaFolders());
    } catch (err) {
      console.error(err);
    }
  };

  const refreshFolderContent = () => {
    setFolderRefreshVersion((current) => current + 1);
  };

  const handleFolderDrop = async (
    targetFolderId: string,
    sourceFolderId: string,
  ) => {
    try {
      await updateMediaFolder(sourceFolderId, {
        parentId: targetFolderId,
      });
      await refreshFolders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFolderDropToRoot = async (sourceFolderId: string) => {
    try {
      await updateMediaFolder(sourceFolderId, { parentId: null });
      await refreshFolders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMediaDrop = async (folderId: string, mediaId: string) => {
    try {
      await addMediaToFolder(folderId, mediaId);
      await refreshFolders();

      // Refresh the visible items if the target folder is currently open.
      if (selectedFolderId === folderId) {
        refreshFolderContent();
      }
    } catch (err) {
      console.error(err);
      window.alert("Media could not be added to this folder.");
    }
  };

  // Drag media out of the currently opened folder, just like Games.
  const handleLibraryDragStart = (event: DragEvent<HTMLElement>) => {
    if (
      selectedFolderId !== null &&
      event.dataTransfer.types.includes("application/x-media-id")
    ) {
      // The sidebar copies items; the red drop zone removes folder membership.
      event.dataTransfer.effectAllowed = "copyMove";
      setIsMediaDragging(true);
    }
  };

  const handleLibraryDragEnd = () => {
    setIsMediaDragging(false);
    setIsRemoveDropActive(false);
  };

  const handleRemoveDropDragEnter = (event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes("application/x-media-id")) {
      return;
    }
    event.preventDefault();
    setIsRemoveDropActive(true);
  };

  const handleRemoveDropDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes("application/x-media-id")) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsRemoveDropActive(true);
  };

  const handleRemoveDropDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const related = event.relatedTarget;
    if (related instanceof Node && event.currentTarget.contains(related)) {
      return;
    }
    setIsRemoveDropActive(false);
  };

  const handleRemoveDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsMediaDragging(false);
    setIsRemoveDropActive(false);

    const mediaId = event.dataTransfer.getData("application/x-media-id");
    if (!mediaId || selectedFolderId === null) {
      return;
    }

    try {
      await removeMediaFromFolder(selectedFolderId, mediaId);
      await refreshFolders();
      refreshFolderContent();
    } catch (err) {
      console.error(err);
      window.alert("Media could not be removed from this folder.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const resetForm = () => {
    setTitle("");
    setType("movie");
    setGenres([]);
    setStatus("ongoing");
    setScore("");
    setDescription("");
    setFormError("");
    setEditingMediaId(null);
  };

  const toggleGenre = (genre: MediaGenre) => {
    setGenres((current) =>
      current.includes(genre)
        ? current.filter((item) => item !== genre)
        : [...current, genre],
    );
  };

  const openAddMedia = () => {
    resetForm();
    setModalMode("add");
    setIsAddMediaOpen(true);
  };

  const openEditMedia = (item: MediaItem) => {
    setModalMode("edit");
    setEditingMediaId(item.id);
    setTitle(item.title);
    setType(item.type);
    setGenres([...item.genres]);
    setStatus(item.status);
    setScore(item.score !== undefined ? String(item.score) : "");
    setDescription(item.description ?? "");
    setFormError("");
    setSelectedMedia(null);
    setIsAddMediaOpen(true);
  };

  const closeAddMedia = () => {
    if (savingMedia) {
      return;
    }

    setIsAddMediaOpen(false);
    resetForm();
  };

  const handleSubmitMedia = async () => {
    if (savingMedia) {
      return;
    }

    setFormError("");

    if (!title.trim()) {
      setFormError("Media title is required.");
      return;
    }

    if (title.trim().length > 200) {
      setFormError("Title must be at most 200 characters.");
      return;
    }

    if (genres.length === 0) {
      setFormError("Select at least one genre.");
      return;
    }

    if (description.trim().length > 5000) {
      setFormError("Description must be at most 5000 characters.");
      return;
    }

    let numericScore: number | undefined;

    if (score.trim()) {
      numericScore = Number(score);

      if (
        !Number.isFinite(numericScore) ||
        numericScore < 1 ||
        numericScore > 10
      ) {
        setFormError("Score must be between 1.0 and 10.0.");
        return;
      }

      if (!Number.isInteger(numericScore * 10)) {
        setFormError("Score can have at most one decimal place.");
        return;
      }
    }

    if (modalMode === "edit" && editingMediaId === null) {
      setFormError("The selected media could not be found.");
      return;
    }

    setSavingMedia(true);

    try {
      const input = {
        title: title.trim(),
        type,
        genres,
        status,
        ...(numericScore !== undefined ? { score: numericScore } : {}),
        description: description.trim(),
      };

      if (modalMode === "edit" && editingMediaId !== null) {
        const updated = await updateMedia(editingMediaId, {
          ...input,
          score: numericScore ?? null,
        });

        setMedia((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await createMedia(input);
        setMedia((current) => [...current, created]);
      }

      setIsAddMediaOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      setFormError(
        modalMode === "edit"
          ? "Media could not be updated. Please try again."
          : "Media could not be created. Please try again.",
      );
    } finally {
      setSavingMedia(false);
    }
  };

  const handleDeleteMedia = async () => {
    if (!selectedMedia) {
      return;
    }

    const mediaId = selectedMedia.id;

    try {
      await deleteMedia(mediaId);
      setMedia((current) => current.filter((item) => item.id !== mediaId));
      setSelectedMedia(null);
      await refreshFolders();
      refreshFolderContent();
    } catch (err) {
      console.error(err);
      window.alert("Media could not be deleted. Please try again.");
    }
  };

  return (
    <div className="h-dvh overflow-hidden bg-gray-950 text-gray-100">
      <div className="flex h-full min-h-0">
        <MediaSidebar
          user={user}
          folders={folders}
          allMedia={media}
          selectedFolderId={selectedFolderId}
          selectedStatus={selectedStatus}
          onFolderSelect={(folderId) => {
            setSelectedFolderId(folderId);
            if (folderId !== null) {
              setSelectedStatus(null);
            }
          }}
          onStatusSelect={(nextStatus) => {
            setSelectedStatus(nextStatus);
            if (nextStatus !== null) {
              setSelectedFolderId(null);
            }
          }}
          onFolderCreated={(folder) => {
            setFolders((current) => [...current, folder]);
          }}
          onFolderUpdated={(folder) => {
            setFolders((current) =>
              current.map((item) => (item.id === folder.id ? folder : item)),
            );
          }}
          onFolderDeleted={(folderId) => {
            setFolders((current) =>
              current.filter((folder) => folder.id !== folderId),
            );
            if (selectedFolderId === folderId) {
              setSelectedFolderId(null);
            }
          }}
          onFolderDrop={(folderId, sourceFolderId) => {
            void handleFolderDrop(folderId, sourceFolderId);
          }}
          onFolderDropToRoot={(sourceFolderId) => {
            void handleFolderDropToRoot(sourceFolderId);
          }}
          onMediaDrop={(folderId, mediaId) => {
            void handleMediaDrop(folderId, mediaId);
          }}
          onLogout={handleLogout}
        />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <LibraryHeader
            breadcrumbs={breadcrumbs}
            onBreadcrumbClick={(folderId) => {
              setSelectedStatus(null);
              setSelectedFolderId(folderId);
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAddGame={openAddMedia}
            addButtonLabel="Add Media"
          />

          <div className="shrink-0 px-6 pt-8">
            <MediaToolbar
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              selectedStatus={selectedStatus}
              onStatusChange={(nextStatus) => {
                setSelectedStatus(nextStatus);
                if (nextStatus !== null) {
                  setSelectedFolderId(null);
                }
              }}
              selectedGenres={selectedGenres}
              onGenresChange={setSelectedGenres}
              selectedTypes={selectedTypes}
              onTypesChange={setSelectedTypes}
              minScore={minScore}
              maxScore={maxScore}
              onMinScoreChange={setMinScore}
              onMaxScoreChange={setMaxScore}
              sortOption={sortOption}
              onSortChange={setSortOption}
            />
          </div>

          <section
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onDragStart={handleLibraryDragStart}
            onDragEnd={handleLibraryDragEnd}
          >
            {!loading && error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            {!loading && folderError && (
              <p className="text-sm text-red-400">{folderError}</p>
            )}

            {(loading || loadingFolder) && (
              <p className="text-sm text-gray-500">Loading media...</p>
            )}

            {!loading &&
              !loadingFolder &&
              !error &&
              !folderError &&
              (filteredAndSortedMedia.length > 0 ||
                (media.length === 0 &&
                  selectedStatus === null &&
                  selectedFolderId === null)) && (
                <MediaContent
                  media={filteredAndSortedMedia}
                  loadingMedia={false}
                  viewMode={viewMode}
                  onMediaClick={setSelectedMedia}
                  sourceFolderId={selectedFolderId}
                />
              )}

            {!loading &&
              !loadingFolder &&
              !error &&
              !folderError &&
              filteredAndSortedMedia.length === 0 &&
              !(
                media.length === 0 &&
                selectedStatus === null &&
                selectedFolderId === null
              ) && (
                <div className="border border-dashed border-gray-800 bg-gray-900/40 p-12 text-center">
                  <h3 className="text-lg font-semibold text-gray-300">
                    No media found
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {visibleMedia.length > 0
                      ? "Try changing your search or filters."
                      : selectedFolderId !== null
                        ? "This folder has no media items yet."
                        : "No media items have this status."}
                  </p>
                </div>
              )}

            {selectedFolderId !== null && isMediaDragging && (
              <div
                onDragEnter={handleRemoveDropDragEnter}
                onDragOver={handleRemoveDropDragOver}
                onDragLeave={handleRemoveDropDragLeave}
                onDrop={(event) => void handleRemoveDrop(event)}
                className={`mt-6 flex min-h-16 w-full items-center justify-center border-2 border-dashed px-6 text-sm font-semibold transition ${
                  isRemoveDropActive
                    ? "border-red-400 bg-red-500/10 text-red-300 shadow-[0_0_24px_rgba(248,113,113,0.08)]"
                    : "border-gray-800 bg-gray-900/30 text-gray-600"
                }`}
              >
                {isRemoveDropActive
                  ? "Release to remove from folder"
                  : "Drag here to remove from folder"}
              </div>
            )}
          </section>
        </main>
      </div>

      {selectedMedia && (
        <MediaDetailsModal
          media={selectedMedia}
          folders={folders}
          onClose={() => setSelectedMedia(null)}
          onEdit={() => openEditMedia(selectedMedia)}
          onDelete={() => void handleDeleteMedia()}
          onFoldersChanged={() => {
            void refreshFolders();
            refreshFolderContent();
          }}
        />
      )}

      <AddMediaModal
        isOpen={isAddMediaOpen}
        mode={modalMode}
        title={title}
        type={type}
        genres={genres}
        status={status}
        score={score}
        description={description}
        savingMedia={savingMedia}
        formError={formError}
        onTitleChange={setTitle}
        onTypeChange={setType}
        onToggleGenre={toggleGenre}
        onStatusChange={setStatus}
        onScoreChange={setScore}
        onDescriptionChange={setDescription}
        onClose={closeAddMedia}
        onSubmit={() => void handleSubmitMedia()}
      />
    </div>
  );
}

export default MediaLibraryPage;
