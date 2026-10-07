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

import {
  addGameToFolder,
  getFolders,
  getGamesInFolder,
  type Folder,
} from "../api/folders";

function LibraryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [allGames, setAllGames] = useState<Game[]>([]);

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

  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<GameStatus | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    const savedViewMode = localStorage.getItem("game-library-view-mode");

    return savedViewMode === "list" ? "list" : "grid";
  });

  useEffect(() => {
    localStorage.setItem("game-library-view-mode", viewMode);
  }, [viewMode]);

  const breadcrumbs = (() => {
    if (selectedStatus !== null) {
      const statusNames: Record<GameStatus, string> = {
        finished: "Finished",
        ongoing: "Ongoing",
        paused: "Paused",
        dropped: "Dropped",
        "waiting-list": "Waiting List",
        platinumed: "Platinumed",
      };

      return [
        {
          id: null,
          name: statusNames[selectedStatus],
        },
      ];
    }

    if (selectedFolderId === null) {
      return [
        {
          id: null,
          name: "Library",
        },
      ];
    }

    const path: { id: string | null; name: string }[] = [];
    let currentFolderId: string | null = selectedFolderId;

    while (currentFolderId !== null) {
      const folder = folders.find((item) => item.id === currentFolderId);

      if (!folder) {
        break;
      }

      path.unshift({
        id: folder.id,
        name: folder.name,
      });

      currentFolderId = folder.parentId;
    }

    return path;
  })();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const loadVisibleGames = async () => {
    setLoadingGames(true);

    try {
      if (selectedFolderId === null) {
        const data = await getGames();

        setAllGames(data);

        if (selectedStatus !== null) {
          setGames(data.filter((game) => game.status === selectedStatus));
        } else {
          setGames(data);
        }

        return;
      }

      const data = await getGamesInFolder(selectedFolderId);
      setGames(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingGames(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadVisibleGames();
  }, [selectedFolderId, selectedStatus]);

  const loadFolders = async () => {
    try {
      const data = await getFolders();
      setFolders(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadFolders();
    };

    void load();
  }, []);

  const handleGameDrop = async (folderId: string, gameId: string) => {
    try {
      await addGameToFolder(folderId, gameId);

      await loadFolders();
      await loadVisibleGames();
    } catch (error) {
      console.error(error);
    }
  };

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

      await loadVisibleGames();
      await loadFolders();

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
        setAllGames((current) =>
          current.map((game) =>
            game.id === updatedGame.id ? updatedGame : game,
          ),
        );
      } else {
        const newGame = await createGame(input);

        setGames((current) => [...current, newGame]);
        setAllGames((current) => [...current, newGame]);
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
        <AppSidebar
          user={user}
          folders={folders}
          allGames={allGames}
          selectedFolderId={selectedFolderId}
          onFolderSelect={setSelectedFolderId}
          onStatusSelect={setSelectedStatus}
          onFolderCreated={(folder) => {
            setFolders((currentFolders) => [...currentFolders, folder]);
          }}
          onFolderUpdated={(updatedFolder) => {
            setFolders((currentFolders) =>
              currentFolders.map((folder) =>
                folder.id === updatedFolder.id ? updatedFolder : folder,
              ),
            );
          }}
          onFolderDeleted={(folderId) => {
            setFolders((currentFolders) =>
              currentFolders.filter((folder) => folder.id !== folderId),
            );

            if (selectedFolderId === folderId) {
              setSelectedFolderId(null);
            }
          }}
          onGameDrop={(folderId, gameId) => {
            void handleGameDrop(folderId, gameId);
          }}
          onLogout={handleLogout}
        />

        <main className="min-w-0 flex-1">
          <LibraryHeader
            breadcrumbs={breadcrumbs}
            onBreadcrumbClick={(folderId) => {
              setSelectedStatus(null);
              setSelectedFolderId(folderId);
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
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
              viewMode={viewMode}
              onGameClick={setSelectedGame}
            />
          </section>

          <GameDetailsModal
            game={selectedGame}
            folders={folders}
            onClose={() => setSelectedGame(null)}
            onEdit={() => {
              if (selectedGame) {
                openEditGame(selectedGame);
              }
            }}
            onDelete={() => void handleDeleteGame()}
            onFoldersChanged={() => {
              void loadVisibleGames();
              void loadFolders();
            }}
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
