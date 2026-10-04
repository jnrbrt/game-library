import { FolderGameRepository } from "../storage/folder-game-repository.js";
import { folderGamesStore } from "../storage/stores.js";

export const folderGameRepository = new FolderGameRepository(folderGamesStore);
