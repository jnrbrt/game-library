import path from "node:path";

import type { User, Game, Folder, FolderGame } from "../types/models.js";

import { JsonStore } from "./json-store.js";

const dataDirectory = path.resolve(process.cwd(), "data");

export const usersStore = new JsonStore<User[]>(
  path.join(dataDirectory, "users.json"),
);

export const gamesStore = new JsonStore<Game[]>(
  path.join(dataDirectory, "games.json"),
);

export const foldersStore = new JsonStore<Folder[]>(
  path.join(dataDirectory, "folders.json"),
);

export const folderGamesStore = new JsonStore<FolderGame[]>(
  path.join(dataDirectory, "folder-games.json"),
);
