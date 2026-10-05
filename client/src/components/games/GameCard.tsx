import type { Game } from "../../api/games";

interface GameCardProps {
  game: Game;
}

function GameCard({ game }: GameCardProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <h3 className="font-semibold text-white">{game.name}</h3>

      <p className="mt-2 text-sm text-gray-500">
        {game.status
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")}
      </p>
    </div>
  );
}

export default GameCard;
