import type { Game } from "../../api/games";
import GameCard from "./GameCard";

interface GameGridProps {
  games: Game[];
}

function GameGrid({ games }: GameGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}

export default GameGrid;
