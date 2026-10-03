export type GameStatus =
  | "finished"
  | "ongoing"
  | "paused"
  | "dropped"
  | "waiting-list"
  | "platinumed";

export type GameGenre =
  | "action"
  | "adventure"
  | "rpg"
  | "strategy"
  | "simulation"
  | "racing"
  | "sports"
  | "fighting"
  | "platformer"
  | "puzzle"
  | "horror"
  | "survival"
  | "shooter"
  | "stealth"
  | "mmo"
  | "metroidvania"
  | "soulslike"
  | "roguelike"
  | "roguelite"
  | "open-world"
  | "sandbox"
  | "deckbuilder"
  | "tower-defense"
  | "rts"
  | "tactical"
  | "turn-based"
  | "4x"
  | "crpg"
  | "jrpg"
  | "arpg"
  | "mmorpg";

export type GamePlatform =
  | "pc"
  | "playstation"
  | "xbox"
  | "nintendo"
  | "mobile";

export interface User {
  id: string;
  username: string;
  passwordHash: string;
}

export interface Game {
  id: string;
  ownerId: string;
  name: string;
  genres: GameGenre[];
  rating?: number;
  status: GameStatus;
  description?: string;
  platforms: GamePlatform[];
  createdAt: string;
}

export interface Folder {
  id: string;
  ownerId: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export interface FolderGame {
  folderId: string;
  gameId: string;
}
