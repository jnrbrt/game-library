import type { MediaItem } from "../../api/media";
import MediaGrid from "./MediaGrid";
import MediaList from "./MediaList";

interface MediaContentProps {
  media: MediaItem[];
  loadingMedia: boolean;
  viewMode: "grid" | "list";
  onMediaClick: (item: MediaItem) => void;
  sourceFolderId: string | null;
}

function MediaContent({
  media,
  loadingMedia,
  viewMode,
  onMediaClick,
  sourceFolderId,
}: MediaContentProps) {
  if (loadingMedia) {
    return <p className="text-sm text-gray-500">Loading media...</p>;
  }

  if (media.length === 0) {
    return (
      <div className="border border-dashed border-gray-800 bg-gray-900/40 p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-300">
          Your library is empty
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Movies, shows and books will appear here.
        </p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <MediaList
        media={media}
        onMediaClick={onMediaClick}
        sourceFolderId={sourceFolderId}
      />
    );
  }

  return (
    <MediaGrid
      media={media}
      onMediaClick={onMediaClick}
      sourceFolderId={sourceFolderId}
    />
  );
}

export default MediaContent;
