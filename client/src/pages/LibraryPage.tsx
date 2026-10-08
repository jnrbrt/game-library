import { useEffect, useMemo, useState } from "react";
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
import LibraryToolbar, {
  type SortOption,
} from "../components/games/LibraryToolbar";

import {
  addGameToFolder,
  getFolders,
  getGamesInFolder,
  removeGameFromFolder,
  updateFolder,
  type Folder,
} from "../api/folders";

const SORT_STORAGE_KEY = "game-library-sort";

const DEFAULT_SORT: SortOption = "name-asc";

const isSortOption = (value: string | null): value is SortOption => {
  return (
    value === "name-asc" ||
    value === "name-desc" ||
    value === "rating-desc" ||
    value === "rating-asc" ||
    value === "created-desc" ||
    value === "created-asc"
  );
};

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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<GameGenre[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<GamePlatform[]>(
    [],
  );
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");

  const [sortOption, setSortOption] = useState<SortOption>(() => {
    const savedSort = localStorage.getItem(SORT_STORAGE_KEY);

    return isSortOption(savedSort) ? savedSort : DEFAULT_SORT;
  });

  const [isGameDragging, setIsGameDragging] = useState(false);
  const [isRemoveDropActive, setIsRemoveDropActive] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    const savedViewMode = localStorage.getItem("game-library-view-mode");

    return savedViewMode === "list" ? "list" : "grid";
  });

  useEffect(() => {
    localStorage.setItem("game-library-view-mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(SORT_STORAGE_KEY, sortOption);
  }, [sortOption]);

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
    const load = async () => {
      await loadVisibleGames();
    };

    void load();
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

  const filteredAndSortedGames = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLocaleLowerCase();

    const parsedMinRating =
      minRating.trim() === "" ? undefined : Number(minRating);
    const parsedMaxRating =
      maxRating.trim() === "" ? undefined : Number(maxRating);

    const filtered = games.filter((game) => {
      if (
        normalizedSearch &&
        !game.name.toLocaleLowerCase().includes(normalizedSearch)
      ) {
        return false;
      }

      if (selectedStatus !== null && game.status !== selectedStatus) {
        return false;
      }

      if (
        selectedGenres.length > 0 &&
        !selectedGenres.some((genre) => game.genres.includes(genre))
      ) {
        return false;
      }

      if (
        selectedPlatforms.length > 0 &&
        !selectedPlatforms.some((platform) => game.platforms.includes(platform))
      ) {
        return false;
      }

      if (
        parsedMinRating !== undefined &&
        Number.isFinite(parsedMinRating) &&
        (game.rating === undefined || game.rating < parsedMinRating)
      ) {
        return false;
      }

      if (
        parsedMaxRating !== undefined &&
        Number.isFinite(parsedMaxRating) &&
        (game.rating === undefined || game.rating > parsedMaxRating)
      ) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          });

        case "name-desc":
          return b.name.localeCompare(a.name, undefined, {
            sensitivity: "base",
          });

        case "rating-desc": {
          const aRating = a.rating ?? -1;
          const bRating = b.rating ?? -1;

          if (aRating !== bRating) {
            return bRating - aRating;
          }

          return a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          });
        }

        case "rating-asc": {
          const aRating = a.rating ?? 11;
          const bRating = b.rating ?? 11;

          if (aRating !== bRating) {
            return aRating - bRating;
          }

          return a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          });
        }

        case "created-desc": {
          const createdDifference =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

          if (createdDifference !== 0) {
            return createdDifference;
          }

          return a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          });
        }

        case "created-asc": {
          const createdDifference =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

          if (createdDifference !== 0) {
            return createdDifference;
          }

          return a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          });
        }

        default:
          return 0;
      }
    });
  }, [
    games,
    searchQuery,
    selectedStatus,
    selectedGenres,
    selectedPlatforms,
    minRating,
    maxRating,
    sortOption,
  ]);

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
          onFolderSelect={(folderId) => {
            setSelectedFolderId(folderId);
            setSelectedStatus(null);
          }}
          onStatusSelect={(status) => {
            setSelectedStatus(status);

            if (status !== null) {
              setSelectedFolderId(null);
            }
          }}
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
            <LibraryToolbar
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              selectedStatus={selectedStatus}
              onStatusChange={(nextStatus) => {
                setSelectedStatus(nextStatus);

                if (nextStatus !== null) {
                  setSelectedFolderId(null);
                }
              }}
              selectedGenres={selectedGenres}
              onGenresChange={setSelectedGenres}
              selectedPlatforms={selectedPlatforms}
              onPlatformsChange={setSelectedPlatforms}
              minRating={minRating}
              maxRating={maxRating}
              onMinRatingChange={setMinRating}
              onMaxRatingChange={setMaxRating}
              sortOption={sortOption}
              onSortChange={setSortOption}
            />

            <LibraryContent
              games={filteredAndSortedGames}
              loadingGames={loadingGames}
              viewMode={viewMode}
              onGameClick={setSelectedGame}
              sourceFolderId={selectedFolderId}
            />

            {!loadingGames &&
              games.length > 0 &&
              filteredAndSortedGames.length === 0 && (
                <div className="border border-dashed border-gray-800 bg-gray-900/40 p-12 text-center">
                  <h3 className="text-lg font-semibold text-gray-300">
                    No games found
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Try changing your search or filters.
                  </p>
                </div>
              )}

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
