import type { GameGenre, GamePlatform, GameStatus } from "../../api/games";

interface AddGameModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  gameName: string;
  genres: GameGenre[];
  status: GameStatus;
  rating: string;
  platforms: GamePlatform[];
  description: string;
  savingGame: boolean;
  formError: string;
  onGameNameChange: (value: string) => void;
  onToggleGenre: (genre: GameGenre) => void;
  onStatusChange: (status: GameStatus) => void;
  onRatingChange: (value: string) => void;
  onTogglePlatform: (platform: GamePlatform) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const GENRES: GameGenre[] = [
  "action",
  "adventure",
  "rpg",
  "strategy",
  "simulation",
  "racing",
  "sports",
  "fighting",
  "platformer",
  "puzzle",
  "horror",
  "survival",
  "shooter",
  "stealth",
  "mmo",
  "metroidvania",
  "soulslike",
  "roguelike",
  "roguelite",
  "open-world",
  "sandbox",
  "deckbuilder",
  "tower-defense",
  "rts",
  "tactical",
  "turn-based",
  "4x",
  "crpg",
  "jrpg",
  "arpg",
  "mmorpg",
];

const STATUSES: GameStatus[] = [
  "finished",
  "ongoing",
  "paused",
  "dropped",
  "waiting-list",
  "platinumed",
];

const PLATFORMS: GamePlatform[] = [
  "pc",
  "playstation",
  "xbox",
  "nintendo",
  "mobile",
];

const formatLabel = (value: string) => {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

function AddGameModal({
  isOpen,
  mode,
  gameName,
  genres,
  status,
  rating,
  platforms,
  description,
  savingGame,
  formError,
  onGameNameChange,
  onToggleGenre,
  onStatusChange,
  onRatingChange,
  onTogglePlatform,
  onDescriptionChange,
  onClose,
  onSubmit,
}: AddGameModalProps) {
  if (!isOpen) {
    return null;
  }

  const isEditMode = mode === "edit";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur-sm">
      <div className="relative mx-auto w-full max-w-2xl overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.035] via-transparent to-transparent" />

        <div className="relative border-b border-gray-800 px-7 py-6">
          <div className="flex items-center justify-between gap-6">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              {isEditMode ? "Edit Game" : "Add Game"}
            </h3>

            <button
              type="button"
              onClick={onClose}
              disabled={savingGame}
              className="shrink-0 px-3 py-2 text-xl leading-none text-gray-500 transition hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="relative space-y-7 px-7 py-8">
          <div>
            <label
              htmlFor="game-name"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Name
            </label>

            <input
              id="game-name"
              type="text"
              value={gameName}
              onChange={(event) => onGameNameChange(event.target.value)}
              placeholder="Enter game name"
              className="w-full border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-gray-300">Genres</p>

            <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
              {GENRES.map((genre) => {
                const selected = genres.includes(genre);

                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => onToggleGenre(genre)}
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

          <div>
            <label
              htmlFor="game-status"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Status
            </label>

            <select
              id="game-status"
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as GameStatus)
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

          <div>
            <label
              htmlFor="game-rating"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Rating
            </label>

            <input
              id="game-rating"
              type="number"
              min="1"
              max="10"
              step="0.1"
              value={rating}
              onChange={(event) => onRatingChange(event.target.value)}
              placeholder="1.0 - 10.0"
              className="w-full border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-gray-300">Platforms</p>

            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => {
                const selected = platforms.includes(platform);

                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => onTogglePlatform(platform)}
                    className={`border px-3 py-2 text-sm transition ${
                      selected
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-gray-700 bg-gray-950 text-gray-400 hover:border-gray-600 hover:text-white"
                    }`}
                  >
                    {formatLabel(platform)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="game-description"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Description
            </label>

            <textarea
              id="game-description"
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Write something about the game..."
              rows={5}
              className="w-full resize-y border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
            />
          </div>

          {formError && (
            <p className="border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {formError}
            </p>
          )}
        </div>

        <div className="relative border-t border-gray-800 bg-gray-950/60 px-7 py-5">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={savingGame}
              className="border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={savingGame}
              className="border border-blue-500/30 bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingGame
                ? isEditMode
                  ? "Saving..."
                  : "Adding..."
                : isEditMode
                  ? "Save Changes"
                  : "Add Game"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddGameModal;
