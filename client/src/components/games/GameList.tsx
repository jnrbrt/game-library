import type { DragEvent } from "react";
import type { Game } from "../../api/games";

interface GameListProps {
  games: Game[];
  onGameClick: (game: Game) => void;
  sourceFolderId: string | null;
}

const STATUS_STYLES: Record<Game["status"], string> = {
  finished: "bg-green-500",
  ongoing: "bg-blue-500",
  paused: "bg-yellow-500",
  dropped: "bg-red-500",
  "waiting-list": "bg-gray-500",
  platinumed: "bg-sky-400",
};

function GameList({ games, onGameClick, sourceFolderId }: GameListProps) {
  const handleDragStart = (
    event: DragEvent<HTMLButtonElement>,
    gameId: string,
  ) => {
    event.dataTransfer.setData("application/x-game-id", gameId);

    if (sourceFolderId !== null) {
      event.dataTransfer.setData(
        "application/x-source-folder-id",
        sourceFolderId,
      );
    }

    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex flex-col gap-2 border border-gray-800">
      {games.map((game) => {
        const isPlatinumed = game.status === "platinumed";

        return (
          <button
            key={game.id}
            type="button"
            draggable
            onClick={() => onGameClick(game)}
            onDragStart={(event) => handleDragStart(event, game.id)}
            className={`group relative flex min-h-16 w-full items-center border-b border-gray-800 bg-gray-900 text-left transition last:border-b-0 ${
              isPlatinumed
                ? "bg-sky-950/20 shadow-[0_0_24px_rgba(56,189,248,0.08)] hover:bg-sky-950/30"
                : "hover:bg-gray-800"
            }`}
          >
            <div
              className={`absolute inset-y-0 left-0 w-1.5 ${STATUS_STYLES[game.status]}`}
            />

            {isPlatinumed && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-300/[0.04] via-transparent to-transparent" />
            )}

            <div className="relative flex min-w-0 flex-1 items-center gap-3 px-6 py-4 pl-8">
              <span className="min-w-0 truncate text-base font-semibold text-white">
                {game.name}
              </span>

              {game.rating !== undefined && (
                <span
                  className={`shrink-0 text-xs font-medium ${
                    isPlatinumed ? "text-sky-300/80" : "text-gray-500"
                  }`}
                >
                  ★ {game.rating.toFixed(1)}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default GameList;
