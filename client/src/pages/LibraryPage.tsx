import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { logout } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import {
  createGame,
  getGames,
  type Game,
  type GameGenre,
  type GamePlatform,
  type GameStatus,
} from "../api/games";

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

function LibraryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  const [isAddGameOpen, setIsAddGameOpen] = useState(false);

  const [gameName, setGameName] = useState("");
  const [genres, setGenres] = useState<GameGenre[]>([]);
  const [status, setStatus] = useState<GameStatus>("ongoing");
  const [rating, setRating] = useState("");
  const [platforms, setPlatforms] = useState<GamePlatform[]>([]);
  const [description, setDescription] = useState("");

  const [savingGame, setSavingGame] = useState(false);
  const [formError, setFormError] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const loadGames = async () => {
      try {
        const data = await getGames();
        setGames(data);
      } finally {
        setLoadingGames(false);
      }
    };

    void loadGames();
  }, []);

  const toggleGenre = (genre: GameGenre) => {
    setGenres((current) =>
      current.includes(genre)
        ? current.filter((item) => item !== genre)
        : [...current, genre],
    );
  };

  const togglePlatform = (platform: GamePlatform) => {
    setPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    );
  };

  const resetForm = () => {
    setGameName("");
    setGenres([]);
    setStatus("ongoing");
    setRating("");
    setPlatforms([]);
    setDescription("");
    setFormError("");
  };

  const handleCloseAddGame = () => {
    if (savingGame) {
      return;
    }

    setIsAddGameOpen(false);
    resetForm();
  };

  const handleCreateGame = async () => {
    setFormError("");

    if (!gameName.trim()) {
      setFormError("Game name is required.");
      return;
    }

    if (genres.length === 0) {
      setFormError("Select at least one genre.");
      return;
    }

    if (platforms.length === 0) {
      setFormError("Select at least one platform.");
      return;
    }

    let numericRating: number | undefined;

    if (rating.trim()) {
      numericRating = Number(rating);

      if (
        !Number.isFinite(numericRating) ||
        numericRating < 1 ||
        numericRating > 10
      ) {
        setFormError("Rating must be between 1.0 and 10.0.");
        return;
      }

      if (Math.round(numericRating * 10) !== numericRating * 10) {
        setFormError("Rating can have at most one decimal place.");
        return;
      }
    }

    setSavingGame(true);

    try {
      const newGame = await createGame({
        name: gameName.trim(),
        genres,
        status,
        platforms,
        ...(numericRating !== undefined ? { rating: numericRating } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
      });

      setGames((current) => [...current, newGame]);

      setIsAddGameOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      setFormError("The game could not be created. Please try again.");
    } finally {
      setSavingGame(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-gray-800 bg-gray-900 md:flex md:flex-col">
          <div className="border-b border-gray-800 px-6 py-5">
            <h1 className="text-xl font-bold text-white">Game Library</h1>

            <p className="mt-1 text-xs text-gray-500">Personal collection</p>
          </div>

          <nav className="flex-1 p-4">
            <button
              type="button"
              className="w-full rounded-lg bg-gray-800 px-4 py-3 text-left text-sm font-medium text-white"
            >
              Library
            </button>
          </nav>

          <div className="border-t border-gray-800 p-4">
            <div className="mb-3 px-2">
              <p className="text-xs text-gray-500">Signed in as</p>

              <p className="mt-1 truncate text-sm font-medium text-gray-200">
                {user?.username}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-gray-400 transition hover:bg-gray-800 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <header className="border-b border-gray-800 bg-gray-950 px-6 py-5">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Library</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your game collection
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormError("");
                  setIsAddGameOpen(true);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                + Add Game
              </button>
            </div>
          </header>

          <section className="mx-auto max-w-7xl px-6 py-8">
            {loadingGames ? (
              <p className="text-sm text-gray-500">Loading games...</p>
            ) : games.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-800 bg-gray-900/40 p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-300">
                  Your library is empty
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Games and folders will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="rounded-xl border border-gray-800 bg-gray-900 p-5"
                  >
                    <h3 className="font-semibold text-white">{game.name}</h3>

                    <p className="mt-2 text-sm text-gray-500">
                      {formatLabel(game.status)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Add Game Modal */}
          {isAddGameOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-8">
              <div className="mx-auto w-full max-w-2xl rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Add Game</h3>

                  <button
                    type="button"
                    onClick={handleCloseAddGame}
                    disabled={savingGame}
                    className="rounded-lg px-3 py-2 text-gray-400 transition hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-8 space-y-6">
                  {/* Name */}
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
                      onChange={(event) => setGameName(event.target.value)}
                      placeholder="Enter game name"
                      className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
                    />
                  </div>

                  {/* Genres */}
                  <div>
                    <p className="mb-3 text-sm font-medium text-gray-300">
                      Genres
                    </p>

                    <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
                      {GENRES.map((genre) => {
                        const selected = genres.includes(genre);

                        return (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => toggleGenre(genre)}
                            className={`rounded-lg border px-3 py-2 text-sm transition ${
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
                      htmlFor="game-status"
                      className="mb-2 block text-sm font-medium text-gray-300"
                    >
                      Status
                    </label>

                    <select
                      id="game-status"
                      value={status}
                      onChange={(event) =>
                        setStatus(event.target.value as GameStatus)
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                    >
                      {STATUSES.map((item) => (
                        <option key={item} value={item}>
                          {formatLabel(item)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating */}
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
                      onChange={(event) => setRating(event.target.value)}
                      placeholder="1.0 - 10.0"
                      className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
                    />
                  </div>

                  {/* Platforms */}
                  <div>
                    <p className="mb-3 text-sm font-medium text-gray-300">
                      Platforms
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map((platform) => {
                        const selected = platforms.includes(platform);

                        return (
                          <button
                            key={platform}
                            type="button"
                            onClick={() => togglePlatform(platform)}
                            className={`rounded-lg border px-3 py-2 text-sm transition ${
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

                  {/* Description */}
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
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Write something about the game..."
                      rows={5}
                      className="w-full resize-y rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
                    />
                  </div>

                  {/* Error */}
                  {formError && (
                    <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                      {formError}
                    </p>
                  )}
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseAddGame}
                    disabled={savingGame}
                    className="rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleCreateGame()}
                    disabled={savingGame}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingGame ? "Adding..." : "Add Game"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default LibraryPage;
