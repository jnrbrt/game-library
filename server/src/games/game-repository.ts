import { Repository } from "../storage/repository.js";
import type { Game } from "../types/models.js";
import { gamesStore } from "../storage/stores.js";

export const gameRepository = new Repository<Game>(gamesStore);
