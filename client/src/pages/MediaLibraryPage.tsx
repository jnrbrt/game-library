import { useEffect, useMemo, useState } from "react";
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
  updateMediaFolder,
  type MediaFolder,
} from "../api/media-folders";

import MediaSidebar from "../components/layout/MediaSidebar";
import MediaCard from "../components/media/MediaCard";
import AddMediaModal from "../components/media/AddMediaModal";
import MediaDetailsModal from "../components/media/MediaDetailsModal";

const STATUS_LABELS: Record<MediaStatus, string> = {
  finished: "Finished",
  ongoing: "Ongoing",
  paused: "Paused",
  dropped: "Dropped",
  "waiting-list": "Waiting List",
};

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

  const currentFolder = folders.find(
    (folder) => folder.id === selectedFolderId,
  );
  const pageTitle =
    selectedStatus !== null
      ? STATUS_LABELS[selectedStatus]
      : selectedFolderId !== null
        ? (currentFolder?.name ?? "Folder")
        : "Library";

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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="flex min-h-screen">
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

        <main className="min-w-0 flex-1">
          <header className="flex items-center justify-between gap-4 border-b border-gray-800 px-6 py-5">
            <h1 className="min-w-0 truncate text-2xl font-bold text-white">
              {pageTitle}
            </h1>

            <button
              type="button"
              onClick={openAddMedia}
              className="shrink-0 bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              + Add Media
            </button>
          </header>

          <section className="px-6 py-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-200">
                {selectedFolderId !== null || selectedStatus !== null
                  ? pageTitle
                  : "All Media"}
              </h2>

              <span className="text-sm text-gray-500">
                {visibleMedia.length} items
              </span>
            </div>

            {(loading || loadingFolder) && (
              <p className="text-sm text-gray-500">Loading media...</p>
            )}

            {!loading && error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            {!loading && folderError && (
              <p className="text-sm text-red-400">{folderError}</p>
            )}

            {!loading &&
              !loadingFolder &&
              !error &&
              !folderError &&
              visibleMedia.length === 0 && (
                <div className="border border-dashed border-gray-800 bg-gray-900/40 p-12 text-center">
                  <h3 className="text-lg font-semibold text-gray-300">
                    No media found
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedFolderId !== null
                      ? "This folder has no media items yet."
                      : selectedStatus !== null
                        ? "No media items have this status."
                        : "Movies, shows and books will appear here."}
                  </p>
                </div>
              )}

            {!loading &&
              !loadingFolder &&
              !error &&
              !folderError &&
              visibleMedia.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleMedia.map((item) => (
                    <MediaCard
                      key={item.id}
                      media={item}
                      sourceFolderId={selectedFolderId}
                      onClick={() => setSelectedMedia(item)}
                    />
                  ))}
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
