import type { MediaItem } from "../../api/media";
import MediaCard from "./MediaCard";

interface MediaGridProps {
  media: MediaItem[];
  onMediaClick: (item: MediaItem) => void;
  sourceFolderId: string | null;
}

function MediaGrid({ media, onMediaClick, sourceFolderId }: MediaGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {media.map((item) => (
        <MediaCard
          key={item.id}
          media={item}
          sourceFolderId={sourceFolderId}
          onClick={() => onMediaClick(item)}
        />
      ))}
    </div>
  );
}

export default MediaGrid;
