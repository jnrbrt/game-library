import { useState } from "react";
import type { GameGenre, GamePlatform, GameStatus } from "../../api/games";

export type SortOption =
  | "name-asc"
  | "name-desc"
  | "rating-desc"
  | "rating-asc"
  | "created-desc"
  | "created-asc";

interface LibraryToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedStatus: GameStatus | null;
  onStatusChange: (status: GameStatus | null) => void;
  selectedGenres: GameGenre[];
  onGenresChange: (genres: GameGenre[]) => void;
  selectedPlatforms: GamePlatform[];
  onPlatformsChange: (platforms: GamePlatform[]) => void;
  minRating: string;
  maxRating: string;
  onMinRatingChange: (value: string) => void;
  onMaxRatingChange: (value: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const STATUS_OPTIONS: { value: GameStatus; label: string }[] = [
  { value: "finished", label: "Finished" },
  { value: "ongoing", label: "Ongoing" },
  { value: "paused", label: "Paused" },
  { value: "dropped", label: "Dropped" },
  { value: "waiting-list", label: "Waiting List" },
  { value: "platinumed", label: "Platinumed" },
];

const GENRE_OPTIONS: { value: GameGenre; label: string }[] = [
  { value: "action", label: "Action" },
  { value: "adventure", label: "Adventure" },
  { value: "rpg", label: "RPG" },
  { value: "strategy", label: "Strategy" },
  { value: "simulation", label: "Simulation" },
  { value: "racing", label: "Racing" },
  { value: "sports", label: "Sports" },
  { value: "fighting", label: "Fighting" },
  { value: "platformer", label: "Platformer" },
  { value: "puzzle", label: "Puzzle" },
  { value: "horror", label: "Horror" },
  { value: "survival", label: "Survival" },
  { value: "shooter", label: "Shooter" },
  { value: "stealth", label: "Stealth" },
  { value: "mmo", label: "MMO" },
  { value: "metroidvania", label: "Metroidvania" },
  { value: "soulslike", label: "Soulslike" },
  { value: "roguelike", label: "Roguelike" },
  { value: "roguelite", label: "Roguelite" },
  { value: "open-world", label: "Open World" },
  { value: "sandbox", label: "Sandbox" },
  { value: "deckbuilder", label: "Deckbuilder" },
  { value: "tower-defense", label: "Tower Defense" },
  { value: "rts", label: "RTS" },
  { value: "tactical", label: "Tactical" },
  { value: "turn-based", label: "Turn-Based" },
  { value: "4x", label: "4X" },
  { value: "crpg", label: "CRPG" },
  { value: "jrpg", label: "JRPG" },
  { value: "arpg", label: "ARPG" },
  { value: "mmorpg", label: "MMORPG" },
];

const PLATFORM_OPTIONS: { value: GamePlatform; label: string }[] = [
  { value: "pc", label: "PC" },
  { value: "playstation", label: "PlayStation" },
  { value: "xbox", label: "Xbox" },
  { value: "nintendo", label: "Nintendo" },
  { value: "mobile", label: "Mobile" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "rating-desc", label: "Rating: High → Low" },
  { value: "rating-asc", label: "Rating: Low → High" },
  { value: "created-desc", label: "Date added: Newest" },
  { value: "created-asc", label: "Date added: Oldest" },
];

function LibraryToolbar({
  searchQuery,
  onSearchQueryChange,
  selectedStatus,
  onStatusChange,
  selectedGenres,
  onGenresChange,
  selectedPlatforms,
  onPlatformsChange,
  minRating,
  maxRating,
  onMinRatingChange,
  onMaxRatingChange,
  sortOption,
  onSortChange,
}: LibraryToolbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(searchQuery.length > 0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const activeFilterCount =
    (selectedStatus !== null ? 1 : 0) +
    selectedGenres.length +
    selectedPlatforms.length +
    (minRating !== "" ? 1 : 0) +
    (maxRating !== "" ? 1 : 0);

  const toggleGenre = (genre: GameGenre) => {
    onGenresChange(
      selectedGenres.includes(genre)
        ? selectedGenres.filter((item) => item !== genre)
        : [...selectedGenres, genre],
    );
  };

  const togglePlatform = (platform: GamePlatform) => {
    onPlatformsChange(
      selectedPlatforms.includes(platform)
        ? selectedPlatforms.filter((item) => item !== platform)
        : [...selectedPlatforms, platform],
    );
  };

  const clearFilters = () => {
    onSearchQueryChange("");
    onStatusChange(null);
    onGenresChange([]);
    onPlatformsChange([]);
    onMinRatingChange("");
    onMaxRatingChange("");
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
                placeholder="Search games..."
                aria-label="Search games"
                className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 text-sm text-gray-200 outline-none placeholder:text-gray-600"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSearchToggle}
              aria-label="Search games"
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
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            aria-label="Sort games"
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
                      : (event.target.value as GameStatus),
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
                {GENRE_OPTIONS.map((option) => {
                  const selected = selectedGenres.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleGenre(option.value)}
                      className={`border px-2 py-1 text-xs transition ${
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
                Platform
              </span>

              <div className="flex flex-wrap gap-1.5">
                {PLATFORM_OPTIONS.map((option) => {
                  const selected = selectedPlatforms.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => togglePlatform(option.value)}
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
                Rating
              </span>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={minRating}
                  onChange={(event) => onMinRatingChange(event.target.value)}
                  placeholder="Min"
                  aria-label="Minimum rating"
                  className="w-full border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-300 outline-none placeholder:text-gray-700 focus:border-gray-700"
                />

                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={maxRating}
                  onChange={(event) => onMaxRatingChange(event.target.value)}
                  placeholder="Max"
                  aria-label="Maximum rating"
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

export default LibraryToolbar;
