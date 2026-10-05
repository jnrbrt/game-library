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

import AppSidebar from "../components/layout/AppSidebar";
import LibraryHeader from "../components/layout/LibraryHeader";
import AddGameModal from "../components/games/AddGameModal";
import LibraryContent from "../components/games/LibraryContent";

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
        <AppSidebar user={user} onLogout={handleLogout} />

        <main className="min-w-0 flex-1">
          <LibraryHeader
            onAddGame={() => {
              setFormError("");
              setIsAddGameOpen(true);
            }}
          />

          <section className="mx-auto max-w-7xl px-6 py-8">
            <LibraryContent games={games} loadingGames={loadingGames} />
          </section>

          <AddGameModal
            isOpen={isAddGameOpen}
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
            onClose={handleCloseAddGame}
            onCreateGame={() => void handleCreateGame()}
          />
        </main>
      </div>
    </div>
  );
}

export default LibraryPage;
