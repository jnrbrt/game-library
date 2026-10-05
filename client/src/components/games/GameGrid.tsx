import type { Game } from "../../api/games";
import GameCard from "./GameCard";

interface GameGridProps {
  games: Game[];
  onGameClick: (game: Game) => void;
}

function GameGrid({ games, onGameClick }: GameGridProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
      {games.map((game) => (
        <GameCard key={game.id} game={game} onClick={() => onGameClick(game)} />
      ))}
    </div>
  );
}

export default GameGrid;
