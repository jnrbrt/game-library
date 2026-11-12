import type { DragEvent } from "react";
import type { MediaItem, MediaType } from "../../api/media";

interface MediaCardProps {
  media: MediaItem;
  onClick: () => void;
  sourceFolderId: string | null;
}

const STATUS_STYLES: Record<MediaItem["status"], string> = {
  finished: "bg-green-500",
  ongoing: "bg-blue-500",
  paused: "bg-yellow-500",
  dropped: "bg-red-500",
  "waiting-list": "bg-gray-500",
};

const TYPE_LABELS: Record<MediaType, string> = {
  movie: "Movie",
  series: "Show",
  book: "Book",
};

const formatStatus = (status: MediaItem["status"]) => {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

function MediaCard({ media, onClick, sourceFolderId }: MediaCardProps) {
  const handleDragStart = (event: DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData("application/x-media-id", media.id);

    if (sourceFolderId !== null) {
      event.dataTransfer.setData(
        "application/x-source-folder-id",
        sourceFolderId,
      );
    }

    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <button
      type="button"
      draggable
      onClick={onClick}
      onDragStart={handleDragStart}
      className="group relative min-h-44 w-full overflow-hidden border border-gray-800 bg-gray-900 p-7 text-left transition duration-200 hover:border-gray-700"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.045] via-transparent to-transparent transition duration-300 group-hover:from-white/[0.075]" />

      <div
        className={`absolute inset-y-0 left-0 w-1.5 ${STATUS_STYLES[media.status]}`}
      />

      <div className="relative flex h-full flex-col justify-between pl-4">
        <div>
          <h3 className="text-xl font-semibold leading-snug text-white transition group-hover:text-gray-100">
            {media.title}
          </h3>

          <p className="mt-1 text-sm font-medium text-gray-500">
            {TYPE_LABELS[media.type]}
          </p>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-gray-500">
            {formatStatus(media.status)}
          </p>

          {media.score !== undefined && (
            <p className="text-sm font-semibold text-gray-300">
              ★ {media.score.toFixed(1)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export default MediaCard;
