import type { Game } from "../../api/games";
import GameCard from "./GameCard";

interface GameGridProps {
  games: Game[];
  onGameClick: (game: Game) => void;
  sourceFolderId: string | null;
}

function GameGrid({ games, onGameClick, sourceFolderId }: GameGridProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          sourceFolderId={sourceFolderId}
          onClick={() => onGameClick(game)}
        />
      ))}
    </div>
  );
}

export default GameGrid;
