import { useEffect, useState } from "react";

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

import { getMediaFolders, type MediaFolder } from "../api/media-folders";

import MediaCard from "../components/media/MediaCard";
import AddMediaModal from "../components/media/AddMediaModal";
import MediaDetailsModal from "../components/media/MediaDetailsModal";

function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Add / Edit modal
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);

  // Form
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MediaType>("movie");
  const [genres, setGenres] = useState<MediaGenre[]>([]);
  const [status, setStatus] = useState<MediaStatus>("ongoing");
  const [score, setScore] = useState("");
  const [description, setDescription] = useState("");

  const [savingMedia, setSavingMedia] = useState(false);
  const [formError, setFormError] = useState("");

  // Initial loading
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

  const refreshFolders = async () => {
    try {
      const data = await getMediaFolders();
      setFolders(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Form helpers
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

  // Add / Edit media
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

  // Delete media
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
    } catch (err) {
      console.error(err);
      window.alert("Media could not be deleted. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 border-b border-gray-800 px-6 py-5">
        <h1 className="text-2xl font-bold text-white">Media Library</h1>

        <button
          type="button"
          onClick={openAddMedia}
          className="bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          + Add Media
        </button>
      </header>

      {/* Content */}
      <main className="px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-200">All Media</h2>

          <span className="text-sm text-gray-500">{media.length} items</span>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading media...</p>}

        {!loading && error && <p className="text-sm text-red-400">{error}</p>}

        {!loading && !error && media.length === 0 && (
          <div className="border border-dashed border-gray-800 bg-gray-900/40 p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-300">
              Your media library is empty
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Movies, shows and books will appear here.
            </p>
          </div>
        )}

        {!loading && !error && media.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {media.map((item) => (
              <MediaCard
                key={item.id}
                media={item}
                sourceFolderId={null}
                onClick={() => setSelectedMedia(item)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Media Details */}
      {selectedMedia && (
        <MediaDetailsModal
          media={selectedMedia}
          folders={folders}
          onClose={() => setSelectedMedia(null)}
          onEdit={() => openEditMedia(selectedMedia)}
          onDelete={() => void handleDeleteMedia()}
          onFoldersChanged={() => {
            void refreshFolders();
          }}
        />
      )}

      {/* Add / Edit Media */}
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
