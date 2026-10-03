import { z } from "zod";

export const createGameSchema = z.object({
  name: z.string().trim().min(1).max(200),
  genres: z
    .array(
      z.enum([
        "action",
        "adventure",
        "rpg",
        "strategy",
        "simulation",
        "racing",
        "sports",
        "fighting",
        "platformer",
        "puzzle",
        "horror",
        "survival",
        "shooter",
        "stealth",
        "mmo",
        "metroidvania",
        "soulslike",
        "roguelike",
        "roguelite",
        "open-world",
        "sandbox",
        "deckbuilder",
        "tower-defense",
        "rts",
        "tactical",
        "turn-based",
        "4x",
        "crpg",
        "jrpg",
        "arpg",
        "mmorpg",
      ]),
    )
    .min(1),
  status: z.enum([
    "finished",
    "ongoing",
    "paused",
    "dropped",
    "waiting-list",
    "platinumed",
  ]),
  platforms: z
    .array(z.enum(["pc", "playstation", "xbox", "nintendo", "mobile"]))
    .min(1),
  rating: z.number().min(1).max(10).multipleOf(0.1).optional(),
  description: z.string().optional(),
});
export const updateGameSchema = createGameSchema.partial();
