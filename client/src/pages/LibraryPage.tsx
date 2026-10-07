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
  removeGameFromFolder,
  updateFolder,
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
  const [isGameDragging, setIsGameDragging] = useState(false);
  const [isRemoveDropActive, setIsRemoveDropActive] = useState(false);

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

  const handleRemoveGameFromFolder = async (gameId: string) => {
    if (selectedFolderId === null) {
      return;
    }

    try {
      await removeGameFromFolder(selectedFolderId, gameId);

      await loadFolders();
      await loadVisibleGames();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFolderDrop = async (folderId: string, sourceFolderId: string) => {
    try {
      await updateFolder(sourceFolderId, {
        parentId: folderId,
      });

      await loadFolders();
      await loadVisibleGames();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFolderDropToRoot = async (sourceFolderId: string) => {
    try {
      await updateFolder(sourceFolderId, {
        parentId: null,
      });

      await loadFolders();
      await loadVisibleGames();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLibraryDragStart = (event: React.DragEvent<HTMLElement>) => {
    if (!event.dataTransfer.types.includes("application/x-game-id")) {
      return;
    }

    if (selectedFolderId === null) {
      return;
    }

    setIsGameDragging(true);
  };

  const handleLibraryDragEnd = () => {
    setIsGameDragging(false);
    setIsRemoveDropActive(false);
  };

  const handleRemoveDropDragEnter = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    if (!event.dataTransfer.types.includes("application/x-game-id")) {
      return;
    }

    event.preventDefault();
    setIsRemoveDropActive(true);
  };

  const handleRemoveDropDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes("application/x-game-id")) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsRemoveDropActive(true);
  };

  const handleRemoveDropDragLeave = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    const relatedTarget = event.relatedTarget;

    if (
      relatedTarget instanceof Node &&
      event.currentTarget.contains(relatedTarget)
    ) {
      return;
    }

    setIsRemoveDropActive(false);
  };

  const handleRemoveDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setIsGameDragging(false);
    setIsRemoveDropActive(false);

    const gameId = event.dataTransfer.getData("application/x-game-id");

    if (!gameId) {
      return;
    }

    await handleRemoveGameFromFolder(gameId);
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
          onFolderDrop={(folderId, sourceFolderId) => {
            void handleFolderDrop(folderId, sourceFolderId);
          }}
          onFolderDropToRoot={(sourceFolderId) => {
            void handleFolderDropToRoot(sourceFolderId);
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

          <section
            className="w-full px-6 py-8"
            onDragStart={handleLibraryDragStart}
            onDragEnd={handleLibraryDragEnd}
          >
            <LibraryContent
              games={games}
              loadingGames={loadingGames}
              viewMode={viewMode}
              onGameClick={setSelectedGame}
              sourceFolderId={selectedFolderId}
            />

            {selectedFolderId !== null && isGameDragging && (
              <div
                onDragEnter={handleRemoveDropDragEnter}
                onDragOver={handleRemoveDropDragOver}
                onDragLeave={handleRemoveDropDragLeave}
                onDrop={(event) => void handleRemoveDrop(event)}
                className={`mt-6 flex min-h-16 w-full items-center justify-center border-2 border-dashed px-6 text-sm font-semibold transition ${
                  isRemoveDropActive
                    ? "border-red-400 bg-red-500/10 text-red-300 shadow-[0_0_24px_rgba(248,113,113,0.08)]"
                    : "border-gray-800 bg-gray-900/30 text-gray-600"
                }`}
              >
                {isRemoveDropActive
                  ? "Release to remove from folder"
                  : "Drag here to remove from folder"}
              </div>
            )}
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
