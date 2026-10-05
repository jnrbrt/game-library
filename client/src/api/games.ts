import { apiClient } from "./client";

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

export interface CreateGameInput {
  name: string;
  genres: GameGenre[];
  status: GameStatus;
  platforms: GamePlatform[];
  rating?: number;
  description?: string;
}

export const getGames = async (): Promise<Game[]> => {
  return apiClient<Game[]>("/games");
};

export const createGame = async (input: CreateGameInput): Promise<Game> => {
  return apiClient<Game>("/games", {
    method: "POST",
    body: JSON.stringify(input),
  });
};

export const updateGame = async (
  id: string,
  input: CreateGameInput,
): Promise<Game> => {
  return apiClient<Game>(`/games/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
};

export const deleteGame = async (id: string): Promise<void> => {
  await apiClient<{ success: boolean }>(`/games/${id}`, {
    method: "DELETE",
    body: JSON.stringify({}),
  });
};
