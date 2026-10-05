import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createGame,
  deleteGame,
  getGames,
  updateGame,
  type Game,
  type GameGenre,
  type GamePlatform,
  type GameStatus,
} from "../api/games";

import { logout } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

import AppSidebar from "../components/layout/AppSidebar";
import LibraryHeader from "../components/layout/LibraryHeader";
import AddGameModal from "../components/games/AddGameModal";
import GameDetailsModal from "../components/games/GameDetailsModal";
import LibraryContent from "../components/games/LibraryContent";

function LibraryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [gameModalMode, setGameModalMode] = useState<"add" | "edit">("add");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);

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
    setEditingGameId(null);
  };

  const handleCloseGameModal = () => {
    if (savingGame) {
      return;
    }

    setIsAddGameOpen(false);
    resetForm();
  };

  const openEditGame = (game: Game) => {
    setGameModalMode("edit");
    setEditingGameId(game.id);
    setGameName(game.name);
    setGenres(game.genres);
    setStatus(game.status);
    setRating(game.rating !== undefined ? game.rating.toString() : "");
    setPlatforms(game.platforms);
    setDescription(game.description ?? "");
    setFormError("");
    setSelectedGame(null);
    setIsAddGameOpen(true);
  };

  const handleDeleteGame = async () => {
    if (!selectedGame) {
      return;
    }

    try {
      await deleteGame(selectedGame.id);

      setGames((current) =>
        current.filter((game) => game.id !== selectedGame.id),
      );

      setSelectedGame(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitGame = async () => {
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
      const input = {
        name: gameName.trim(),
        genres,
        status,
        platforms,
        ...(numericRating !== undefined ? { rating: numericRating } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
      };

      if (gameModalMode === "edit") {
        if (!editingGameId) {
          setFormError("The selected game could not be found.");
          return;
        }

        const updatedGame = await updateGame(editingGameId, input);

        setGames((current) =>
          current.map((game) =>
            game.id === updatedGame.id ? updatedGame : game,
          ),
        );
      } else {
        const newGame = await createGame(input);

        setGames((current) => [...current, newGame]);
      }

      setIsAddGameOpen(false);
      setSelectedGame(null);
      resetForm();
    } catch (error) {
      console.error(error);
      setFormError(
        gameModalMode === "edit"
          ? "The game could not be updated. Please try again."
          : "The game could not be created. Please try again.",
      );
    } finally {
      setSavingGame(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="flex min-h-screen">
        <AppSidebar user={user} onLogout={handleLogout} />

        <main className="min-w-0 flex-1">
          <LibraryHeader
            onAddGame={() => {
              resetForm();
              setGameModalMode("add");
              setIsAddGameOpen(true);
            }}
          />

          <section className="w-full px-6 py-8">
            <LibraryContent
              games={games}
              loadingGames={loadingGames}
              onGameClick={setSelectedGame}
            />
          </section>

          <GameDetailsModal
            game={selectedGame}
            onClose={() => setSelectedGame(null)}
            onEdit={() => {
              if (selectedGame) {
                openEditGame(selectedGame);
              }
            }}
            onDelete={() => void handleDeleteGame()}
          />

          <AddGameModal
            isOpen={isAddGameOpen}
            mode={gameModalMode}
            gameName={gameName}
            genres={genres}
            status={status}
            rating={rating}
            platforms={platforms}
            description={description}
            savingGame={savingGame}
            formError={formError}
            onGameNameChange={setGameName}
            onToggleGenre={toggleGenre}
            onStatusChange={setStatus}
            onRatingChange={setRating}
            onTogglePlatform={togglePlatform}
            onDescriptionChange={setDescription}
            onClose={handleCloseGameModal}
            onSubmit={() => void handleSubmitGame()}
          />
        </main>
      </div>
    </div>
  );
}

export default LibraryPage;
