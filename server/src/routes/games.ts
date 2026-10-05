import type { FastifyInstance } from "fastify";

import { requireAuth } from "../auth/require-auth.js";
import { gameRepository } from "../games/game-repository.js";
import { createGameSchema, updateGameSchema } from "../games/game-schemas.js";

import { folderRepository } from "../folders/folder-repository.js";
import { folderGameRepository } from "../folders/folder-game-repository.js";

export const gameRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get("/", async (request) => {
    const userId = await requireAuth(request);

    const games = await gameRepository.getAll();

    return games.filter((game) => game.ownerId === userId);
  });
  app.post("/", async (request, reply) => {
    const userId = await requireAuth(request);

    const result = createGameSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        error: "Invalid game data.",
        details: result.error.issues,
      });
    }

    const game = await gameRepository.create({
      ownerId: userId,
      ...result.data,
      createdAt: new Date().toISOString(),
    });

    return reply.code(201).send(game);
  });

  app.get("/:id/folders", async (request, reply) => {
    const userId = await requireAuth(request);

    const { id } = request.params as { id: string };

    const game = await gameRepository.getById(id);

    if (!game || game.ownerId !== userId) {
      return reply.code(404).send({
        error: "Game not found.",
      });
    }

    const relations = await folderGameRepository.getFoldersForGame(id);

    const folders = await Promise.all(
      relations.map((relation) => folderRepository.getById(relation.folderId)),
    );

    return folders.filter(
      (folder): folder is NonNullable<typeof folder> =>
        folder !== undefined && folder.ownerId === userId,
    );
  });

  app.get("/:id", async (request, reply) => {
    const userId = await requireAuth(request);

    const { id } = request.params as { id: string };

    const game = await gameRepository.getById(id);

    if (!game || game.ownerId !== userId) {
      return reply.code(404).send({
        error: "Game not found.",
      });
    }

    return game;
  });
  app.patch("/:id", async (request, reply) => {
    const userId = await requireAuth(request);

    const { id } = request.params as { id: string };

    const result = updateGameSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        error: "Invalid game data.",
        details: result.error.issues,
      });
    }

    const game = await gameRepository.getById(id);

    if (!game || game.ownerId !== userId) {
      return reply.code(404).send({
        error: "Game not found.",
      });
    }

    const updatedGame = await gameRepository.update(id, result.data);

    return updatedGame;
  });
  app.delete("/:id", async (request, reply) => {
    const userId = await requireAuth(request);

    const { id } = request.params as { id: string };

    const game = await gameRepository.getById(id);

    if (!game || game.ownerId !== userId) {
      return reply.code(404).send({
        error: "Game not found.",
      });
    }

    await gameRepository.delete(id);

    return {
      success: true,
    };
  });
};
