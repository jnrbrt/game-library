import { useState } from "react";
import {
  MEDIA_GENRES,
  type MediaGenre,
  type MediaStatus,
  type MediaType,
} from "../../api/media";

// Keep the same sort values and control layout as the Game Library.
export type MediaSortOption =
  | "name-asc"
  | "name-desc"
  | "rating-desc"
  | "rating-asc"
  | "created-desc"
  | "created-asc";

interface MediaToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedStatus: MediaStatus | null;
  onStatusChange: (status: MediaStatus | null) => void;
  selectedGenres: MediaGenre[];
  onGenresChange: (genres: MediaGenre[]) => void;
  selectedTypes: MediaType[];
  onTypesChange: (types: MediaType[]) => void;
  minScore: string;
  maxScore: string;
  onMinScoreChange: (value: string) => void;
  onMaxScoreChange: (value: string) => void;
  sortOption: MediaSortOption;
  onSortChange: (sort: MediaSortOption) => void;
}

const STATUS_OPTIONS: { value: MediaStatus; label: string }[] = [
  { value: "finished", label: "Finished" },
  { value: "ongoing", label: "Ongoing" },
  { value: "paused", label: "Paused" },
  { value: "dropped", label: "Dropped" },
  { value: "waiting-list", label: "Waiting List" },
];

const TYPE_OPTIONS: { value: MediaType; label: string }[] = [
  { value: "movie", label: "Movie" },
  { value: "series", label: "Show" },
  { value: "book", label: "Book" },
];

const SORT_OPTIONS: { value: MediaSortOption; label: string }[] = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "rating-desc", label: "Score: High → Low" },
  { value: "rating-asc", label: "Score: Low → High" },
  { value: "created-desc", label: "Date added: Newest" },
  { value: "created-asc", label: "Date added: Oldest" },
];

const GENRE_NAMES: Partial<Record<MediaGenre, string>> = {
  "sci-fi": "Sci-Fi",
  "slice-of-life": "Slice of Life",
};

function genreLabel(genre: MediaGenre) {
  return (
    GENRE_NAMES[genre] ??
    genre
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

function MediaToolbar({
  searchQuery,
  onSearchQueryChange,
  selectedStatus,
  onStatusChange,
  selectedGenres,
  onGenresChange,
  selectedTypes,
  onTypesChange,
  minScore,
  maxScore,
  onMinScoreChange,
  onMaxScoreChange,
  sortOption,
  onSortChange,
}: MediaToolbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(searchQuery.length > 0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const activeFilterCount =
    (selectedStatus !== null ? 1 : 0) +
    selectedGenres.length +
    selectedTypes.length +
    (minScore !== "" ? 1 : 0) +
    (maxScore !== "" ? 1 : 0);

  const toggleGenre = (genre: MediaGenre) => {
    onGenresChange(
      selectedGenres.includes(genre)
        ? selectedGenres.filter((item) => item !== genre)
        : [...selectedGenres, genre],
    );
  };

  const toggleType = (type: MediaType) => {
    onTypesChange(
      selectedTypes.includes(type)
        ? selectedTypes.filter((item) => item !== type)
        : [...selectedTypes, type],
    );
  };

  const clearFilters = () => {
    onSearchQueryChange("");
    onStatusChange(null);
    onGenresChange([]);
    onTypesChange([]);
    onMinScoreChange("");
    onMaxScoreChange("");
  };

  const handleSearchToggle = () => {
    setIsSearchOpen((current) => {
      if (current && searchQuery === "") {
        return false;
      }
      return !current;
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {isSearchOpen ? (
            <div className="flex w-full max-w-xl items-center border border-gray-800 bg-gray-900/70">
              <button
                type="button"
                onClick={handleSearchToggle}
                aria-label="Close search"
                className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-500 transition hover:bg-gray-800 hover:text-gray-200"
              >
                ⌕
              </button>
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder="Search media..."
                aria-label="Search media"
                className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 text-sm text-gray-200 outline-none placeholder:text-gray-600"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSearchToggle}
              aria-label="Search media"
              className="flex h-10 w-10 items-center justify-center border border-gray-800 bg-gray-900/70 text-gray-500 transition hover:bg-gray-900 hover:text-gray-200"
            >
              ⌕
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFiltersOpen((current) => !current)}
            className={`flex items-center gap-2 border px-3 py-2.5 text-sm font-medium transition ${
              isFiltersOpen || activeFilterCount > 0
                ? "border-gray-700 bg-gray-800 text-white"
                : "border-gray-800 bg-gray-900/70 text-gray-400 hover:bg-gray-900 hover:text-gray-200"
            }`}
          >
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center bg-gray-700 px-1.5 text-[11px] font-bold text-gray-200">
                {activeFilterCount}
              </span>
            )}
          </button>

          <select
            value={sortOption}
            onChange={(event) =>
              onSortChange(event.target.value as MediaSortOption)
            }
            aria-label="Sort media"
            className="border border-gray-800 bg-gray-900/70 px-3 py-2.5 text-sm font-medium text-gray-400 outline-none transition hover:bg-gray-900 focus:border-gray-700"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isFiltersOpen && (
        <div className="mt-3 border border-gray-800 bg-gray-900/50 p-4">
          <div className="grid gap-5 xl:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_180px]">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                Status
              </label>
              <select
                value={selectedStatus ?? ""}
                onChange={(event) =>
                  onStatusChange(
                    event.target.value === ""
                      ? null
                      : (event.target.value as MediaStatus),
                  )
                }
                className="w-full border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-300 outline-none focus:border-gray-700"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                Genre
              </span>
              <div className="flex max-h-32 flex-wrap gap-1.5 overflow-auto pr-1">
                {MEDIA_GENRES.map((genre) => {
                  const selected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`border px-2 py-1 text-xs transition ${
                        selected
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-800 bg-gray-950 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                      }`}
                    >
                      {genreLabel(genre)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                Type
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TYPE_OPTIONS.map((option) => {
                  const selected = selectedTypes.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleType(option.value)}
                      className={`border px-2.5 py-1.5 text-xs transition ${
                        selected
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-800 bg-gray-950 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                Score
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={minScore}
                  onChange={(event) => onMinScoreChange(event.target.value)}
                  placeholder="Min"
                  aria-label="Minimum score"
                  className="w-full border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-300 outline-none placeholder:text-gray-700 focus:border-gray-700"
                />
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={maxScore}
                  onChange={(event) => onMaxScoreChange(event.target.value)}
                  placeholder="Max"
                  aria-label="Maximum score"
                  className="w-full border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-300 outline-none placeholder:text-gray-700 focus:border-gray-700"
                />
              </div>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-3">
              <span className="text-xs text-gray-600">
                {activeFilterCount} active filter
                {activeFilterCount === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="px-2 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-800 hover:text-white"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MediaToolbar;
