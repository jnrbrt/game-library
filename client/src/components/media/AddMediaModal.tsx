import {
  MEDIA_GENRES,
  type MediaGenre,
  type MediaStatus,
  type MediaType,
} from "../../api/media";

interface AddMediaModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  title: string;
  type: MediaType;
  genres: MediaGenre[];
  status: MediaStatus;
  score: string;
  description: string;
  savingMedia: boolean;
  formError: string;
  onTitleChange: (value: string) => void;
  onTypeChange: (type: MediaType) => void;
  onToggleGenre: (genre: MediaGenre) => void;
  onStatusChange: (status: MediaStatus) => void;
  onScoreChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const TYPES: { value: MediaType; label: string }[] = [
  { value: "movie", label: "Movie" },
  { value: "series", label: "Show" },
  { value: "book", label: "Book" },
];

const STATUSES: MediaStatus[] = [
  "finished",
  "ongoing",
  "paused",
  "dropped",
  "waiting-list",
];

const formatLabel = (value: string) => {
  if (value === "sci-fi") {
    return "Sci-Fi";
  }

  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

function AddMediaModal({
  isOpen,
  mode,
  title,
  type,
  genres,
  status,
  score,
  description,
  savingMedia,
  formError,
  onTitleChange,
  onTypeChange,
  onToggleGenre,
  onStatusChange,
  onScoreChange,
  onDescriptionChange,
  onClose,
  onSubmit,
}: AddMediaModalProps) {
  if (!isOpen) {
    return null;
  }

  const isEditMode = mode === "edit";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur-sm">
      <div className="relative mx-auto w-full max-w-2xl overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.035] via-transparent to-transparent" />

        {/* Header */}
        <div className="relative border-b border-gray-800 px-7 py-6">
          <div className="flex items-center justify-between gap-6">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              {isEditMode ? "Edit Media" : "Add Media"}
            </h3>

            <button
              type="button"
              onClick={onClose}
              disabled={savingMedia}
              className="shrink-0 px-3 py-2 text-xl leading-none text-gray-500 transition hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="relative space-y-7 px-7 py-8">
          {/* Title */}
          <div>
            <label
              htmlFor="media-title"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Title
            </label>

            <input
              id="media-title"
              type="text"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Enter title"
              maxLength={200}
              className="w-full border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
            />
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor="media-type"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Type
            </label>

            <select
              id="media-type"
              value={type}
              onChange={(event) =>
                onTypeChange(event.target.value as MediaType)
              }
              className="w-full border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            >
              {TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Genres */}
          <div>
            <p className="mb-3 text-sm font-medium text-gray-300">Genres</p>

            <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
              {MEDIA_GENRES.map((genre) => {
                const selected = genres.includes(genre);

                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => onToggleGenre(genre)}
                    aria-pressed={selected}
                    className={`border px-3 py-2 text-sm transition ${
                      selected
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-gray-700 bg-gray-950 text-gray-400 hover:border-gray-600 hover:text-white"
                    }`}
                  >
                    {formatLabel(genre)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="media-status"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Status
            </label>

            <select
              id="media-status"
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as MediaStatus)
              }
              className="w-full border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            >
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {formatLabel(item)}
                </option>
              ))}
            </select>
          </div>

          {/* Score */}
          <div>
            <label
              htmlFor="media-score"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Score
            </label>

            <input
              id="media-score"
              type="number"
              min="1"
              max="10"
              step="0.1"
              value={score}
              onChange={(event) => onScoreChange(event.target.value)}
              placeholder="1.0 - 10.0"
              className="w-full border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="media-description"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Description
            </label>

            <textarea
              id="media-description"
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Write something about this media..."
              rows={5}
              maxLength={5000}
              className="w-full resize-y border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
            />
          </div>

          {/* Error */}
          {formError && (
            <p className="border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {formError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="relative border-t border-gray-800 bg-gray-950/60 px-7 py-5">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={savingMedia}
              className="border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={savingMedia}
              className="border border-blue-500/30 bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingMedia
                ? isEditMode
                  ? "Saving..."
                  : "Adding..."
                : isEditMode
                  ? "Save Changes"
                  : "Add Media"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddMediaModal;
