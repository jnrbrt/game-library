import type { Game } from "../../api/games";

interface GameCardProps {
  game: Game;
  onClick: () => void;
}

const STATUS_STYLES: Record<Game["status"], string> = {
  finished: "bg-green-500",
  ongoing: "bg-blue-500",
  paused: "bg-yellow-500",
  dropped: "bg-red-500",
  "waiting-list": "bg-gray-500",
  platinumed: "bg-sky-400",
};

const formatStatus = (status: Game["status"]) => {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

function GameCard({ game, onClick }: GameCardProps) {
  const isPlatinumed = game.status === "platinumed";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative min-h-44 w-full overflow-hidden border bg-gray-900 p-7 text-left transition duration-200 ${
        isPlatinumed
          ? "border-sky-500/40 shadow-[0_0_24px_rgba(56,189,248,0.12)] hover:border-sky-400/70 hover:shadow-[0_0_32px_rgba(56,189,248,0.2)]"
          : "border-gray-800 hover:border-gray-700"
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br from-white/[0.045] via-transparent to-transparent transition duration-300 group-hover:from-white/[0.075] ${
          isPlatinumed
            ? "from-sky-300/[0.10] via-blue-500/[0.035] to-transparent"
            : ""
        }`}
      />

      <div
        className={`absolute inset-y-0 left-0 w-1.5 ${STATUS_STYLES[game.status]}`}
      />

      {isPlatinumed && (
        <>
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-sky-300/[0.035] to-transparent" />
        </>
      )}

      <div className="relative flex h-full flex-col justify-between pl-4">
        <div>
          <h3 className="text-xl font-semibold leading-snug text-white transition group-hover:text-gray-100">
            {game.name}
          </h3>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          <p
            className={`text-sm font-medium ${
              isPlatinumed ? "text-sky-300" : "text-gray-500"
            }`}
          >
            {formatStatus(game.status)}
          </p>

          {game.rating !== undefined && (
            <p className="text-sm font-semibold text-gray-300">
              ★ {game.rating.toFixed(1)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export default GameCard;
