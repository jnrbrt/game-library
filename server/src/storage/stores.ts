import path from "node:path";

import type {
  User,
  Game,
  Folder,
  FolderGame,
  Session,
} from "../types/models.js";

import { JsonStore } from "./json-store.js";

import { Repository } from "./repository.js";

import { fileURLToPath } from "node:url";

const dataDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../data",
);

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

export const usersRepository = new Repository<User>(usersStore);

export const sessionsStore = new JsonStore<Session[]>(
  path.join(dataDirectory, "sessions.json"),
);
