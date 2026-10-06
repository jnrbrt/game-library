import type { Game } from "../../api/games";
import GameGrid from "./GameGrid";
import GameList from "./GameList";

interface LibraryContentProps {
  games: Game[];
  loadingGames: boolean;
  viewMode: "grid" | "list";
  onGameClick: (game: Game) => void;
}

function LibraryContent({
  games,
  loadingGames,
  viewMode,
  onGameClick,
}: LibraryContentProps) {
  if (loadingGames) {
    return <p className="text-sm text-gray-500">Loading games...</p>;
  }

  if (games.length === 0) {
    return (
      <div className="border border-dashed border-gray-800 bg-gray-900/40 p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-300">
          Your library is empty
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Games and folders will appear here.
        </p>
      </div>
    );
  }

  if (viewMode === "list") {
    return <GameList games={games} onGameClick={onGameClick} />;
  }

  return <GameGrid games={games} onGameClick={onGameClick} />;
}

export default LibraryContent;
