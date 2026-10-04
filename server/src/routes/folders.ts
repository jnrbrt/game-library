import type { FastifyInstance } from "fastify";

import { requireAuth } from "../auth/require-auth.js";
import { folderRepository } from "../folders/folder-repository.js";
import {
  createFolderSchema,
  updateFolderSchema,
} from "../folders/folder-schemas.js";
import { gameRepository } from "../games/game-repository.js";
import { folderGameRepository } from "../folders/folder-game-repository.js";
import { wouldCreateFolderCycle } from "../folders/folder-service.js";

export const folderRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get("/", async (request) => {
    const userId = await requireAuth(request);

    const folders = await folderRepository.getAll();

    return folders.filter((folder) => folder.ownerId === userId);
  });

  app.post("/", async (request, reply) => {
    const userId = await requireAuth(request);

    const result = createFolderSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        error: "Invalid folder data.",
        details: result.error.issues,
      });
    }

    if (result.data.parentId !== null) {
      const parentFolder = await folderRepository.getById(result.data.parentId);

      if (!parentFolder || parentFolder.ownerId !== userId) {
        return reply.code(400).send({
          error: "Invalid parent folder.",
        });
      }
    }

    const folder = await folderRepository.create({
      ownerId: userId,
      ...result.data,
      createdAt: new Date().toISOString(),
    });

    return reply.code(201).send(folder);
  });
  app.patch("/:id", async (request, reply) => {
    const userId = await requireAuth(request);

    const { id } = request.params as { id: string };

    const result = updateFolderSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        error: "Invalid folder data.",
        details: result.error.issues,
      });
    }
    if (result.data.parentId !== undefined && result.data.parentId !== null) {
      const parentFolder = await folderRepository.getById(result.data.parentId);

      if (!parentFolder || parentFolder.ownerId !== userId) {
        return reply.code(400).send({
          error: "Invalid parent folder.",
        });
      }

      if (await wouldCreateFolderCycle(id, result.data.parentId)) {
        return reply.code(400).send({
          error: "Folder cannot be moved into itself or its descendants.",
        });
      }
    }

    const folder = await folderRepository.getById(id);

    if (!folder || folder.ownerId !== userId) {
      return reply.code(404).send({
        error: "Folder not found.",
      });
    }

    if (result.data.parentId !== undefined && result.data.parentId !== null) {
      const parentFolder = await folderRepository.getById(result.data.parentId);

      if (!parentFolder || parentFolder.ownerId !== userId) {
        return reply.code(400).send({
          error: "Invalid parent folder.",
        });
      }
    }

    const updatedFolder = await folderRepository.update(id, result.data);

    return updatedFolder;
  });

  app.post("/:folderId/games/:gameId", async (request, reply) => {
    const userId = await requireAuth(request);

    const { folderId, gameId } = request.params as {
      folderId: string;
      gameId: string;
    };

    const folder = await folderRepository.getById(folderId);

    if (!folder || folder.ownerId !== userId) {
      return reply.code(404).send({
        error: "Folder not found.",
      });
    }

    const game = await gameRepository.getById(gameId);

    if (!game || game.ownerId !== userId) {
      return reply.code(404).send({
        error: "Game not found.",
      });
    }

    try {
      const relation = await folderGameRepository.add(folderId, gameId);

      return reply.code(201).send(relation);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Game is already in this folder."
      ) {
        return reply.code(409).send({
          error: error.message,
        });
      }

      throw error;
    }
  });

  app.get("/:folderId/games", async (request, reply) => {
    const userId = await requireAuth(request);

    const { folderId } = request.params as {
      folderId: string;
    };

    const folder = await folderRepository.getById(folderId);

    if (!folder || folder.ownerId !== userId) {
      return reply.code(404).send({
        error: "Folder not found.",
      });
    }

    const relations = await folderGameRepository.getGamesInFolder(folderId);

    const games = await Promise.all(
      relations.map((relation) => gameRepository.getById(relation.gameId)),
    );

    return games.filter(
      (game): game is NonNullable<typeof game> => game !== undefined,
    );
  });

  app.delete("/:folderId/games/:gameId", async (request, reply) => {
    const userId = await requireAuth(request);

    const { folderId, gameId } = request.params as {
      folderId: string;
      gameId: string;
    };

    const folder = await folderRepository.getById(folderId);

    if (!folder || folder.ownerId !== userId) {
      return reply.code(404).send({
        error: "Folder not found.",
      });
    }

    const game = await gameRepository.getById(gameId);

    if (!game || game.ownerId !== userId) {
      return reply.code(404).send({
        error: "Game not found.",
      });
    }

    const removed = await folderGameRepository.remove(folderId, gameId);

    if (!removed) {
      return reply.code(404).send({
        error: "Game is not in this folder.",
      });
    }

    return {
      success: true,
    };
  });

  app.delete("/:id", async (request, reply) => {
    const userId = await requireAuth(request);

    const { id } = request.params as {
      id: string;
    };

    const folder = await folderRepository.getById(id);

    if (!folder || folder.ownerId !== userId) {
      return reply.code(404).send({
        error: "Folder not found.",
      });
    }

    const childFolders = (await folderRepository.getAll()).filter(
      (item) => item.ownerId === userId && item.parentId === id,
    );

    if (childFolders.length > 0) {
      return reply.code(400).send({
        error: "Folder must be empty before it can be deleted.",
      });
    }

    const relations = await folderGameRepository.getGamesInFolder(id);

    for (const relation of relations) {
      await folderGameRepository.remove(relation.folderId, relation.gameId);
    }

    await folderRepository.delete(id);

    return {
      success: true,
    };
  });
};
