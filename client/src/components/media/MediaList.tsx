import type { DragEvent } from "react";
import type { MediaItem, MediaStatus, MediaType } from "../../api/media";

interface MediaListProps {
  media: MediaItem[];
  onMediaClick: (item: MediaItem) => void;
  sourceFolderId: string | null;
}

// Same full-width, status-striped rows as the Game Library's list view.
const STATUS_BORDER: Record<MediaStatus, string> = {
  finished: "border-l-green-600",
  ongoing: "border-l-blue-500",
  paused: "border-l-yellow-400",
  dropped: "border-l-red-500",
  "waiting-list": "border-l-gray-600",
};

const TYPE_LABELS: Record<MediaType, string> = {
  movie: "Movie",
  series: "Show",
  book: "Book",
};

function MediaList({ media, onMediaClick, sourceFolderId }: MediaListProps) {
  const handleDragStart = (
    event: DragEvent<HTMLButtonElement>,
    item: MediaItem,
  ) => {
    event.dataTransfer.setData("application/x-media-id", item.id);
    if (sourceFolderId !== null) {
      event.dataTransfer.setData(
        "application/x-source-folder-id",
        sourceFolderId,
      );
    }
    event.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="space-y-2.5">
      {media.map((item) => (
        <button
          key={item.id}
          type="button"
          draggable
          onDragStart={(event) => handleDragStart(event, item)}
          onClick={() => onMediaClick(item)}
          className={`flex min-h-20 w-full items-center border border-gray-800 border-l-8 bg-gray-900 px-8 py-4 text-left transition hover:bg-gray-800 ${STATUS_BORDER[item.status]}`}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="truncate text-base font-semibold text-white">
                {item.title}
              </span>
              {item.score !== undefined && (
                <span className="shrink-0 text-sm text-gray-500">
                  ★ {item.score.toFixed(1)}
                </span>
              )}
            </div>
            <span className="mt-1 block text-xs text-gray-500">
              {TYPE_LABELS[item.type]}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default MediaList;
