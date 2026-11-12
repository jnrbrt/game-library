import type { FastifyInstance } from "fastify";

import { requireAuth } from "../auth/require-auth.js";
import { mediaFolderRepository } from "../media/media-folder-repository.js";
import { folderMediaRepository } from "../media/folder-media-repository.js";
import { mediaRepository } from "../media/media-repository.js";

import {
  createFolderSchema,
  updateFolderSchema,
} from "../folders/folder-schemas.js";

export const mediaFolderRoutes = async (
  app: FastifyInstance,
): Promise<void> => {
  // Get all media folders
  app.get("/", async (request) => {
    const userId = await requireAuth(request);

    const allFolders = await mediaFolderRepository.getAll();

    const ownedFolders = allFolders.filter(
      (folder) => folder.ownerId === userId,
    );

    const relations = await folderMediaRepository.getAll();

    const allMedia = await mediaRepository.getAll();

    const ownedMediaIds = new Set(
      allMedia.filter((item) => item.ownerId === userId).map((item) => item.id),
    );

    return ownedFolders.map((folder) => {
      const descendantFolderIds = new Set<string>([folder.id]);

      let foldersToCheck = [folder.id];

      while (foldersToCheck.length > 0) {
        const nextFolderIds = ownedFolders
          .filter(
            (candidate) =>
              candidate.parentId !== null &&
              foldersToCheck.includes(candidate.parentId) &&
              !descendantFolderIds.has(candidate.id),
          )
          .map((candidate) => candidate.id);

        for (const folderId of nextFolderIds) {
          descendantFolderIds.add(folderId);
        }

        foldersToCheck = nextFolderIds;
      }

      const mediaIds = new Set(
        relations
          .filter(
            (relation) =>
              descendantFolderIds.has(relation.folderId) &&
              ownedMediaIds.has(relation.mediaId),
          )
          .map((relation) => relation.mediaId),
      );

      return {
        ...folder,
        gameCount: mediaIds.size,
      };
    });
  });

  // Create a media folder
  app.post("/", async (request, reply) => {
    const userId = await requireAuth(request);

    const result = createFolderSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        error: "Invalid media folder data.",
        details: result.error.issues,
      });
    }

    if (result.data.parentId !== null) {
      const parentFolder = await mediaFolderRepository.getById(
        result.data.parentId,
      );

      if (!parentFolder || parentFolder.ownerId !== userId) {
        return reply.code(400).send({
          error: "Invalid parent folder.",
        });
      }
    }

    const folder = await mediaFolderRepository.create({
      ownerId: userId,
      ...result.data,
      createdAt: new Date().toISOString(),
    });

    return reply.code(201).send({
      ...folder,
      gameCount: 0,
    });
  });
  // Rename or move a media folder
  app.patch("/:id", async (request, reply) => {
    const userId = await requireAuth(request);
    const { id } = request.params as { id: string };

    const folder = await mediaFolderRepository.getById(id);

    if (!folder || folder.ownerId !== userId) {
      return reply.code(404).send({
        error: "Media folder not found.",
      });
    }

    const result = updateFolderSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        error: "Invalid media folder data.",
        details: result.error.issues,
      });
    }

    if (result.data.parentId !== undefined && result.data.parentId !== null) {
      const parentFolder = await mediaFolderRepository.getById(
        result.data.parentId,
      );

      if (!parentFolder || parentFolder.ownerId !== userId) {
        return reply.code(400).send({
          error: "Invalid parent folder.",
        });
      }

      // Prevent moving a folder into itself or its descendants.
      let currentParentId: string | null = result.data.parentId;
      const visited = new Set<string>();

      while (currentParentId !== null) {
        if (currentParentId === id || visited.has(currentParentId)) {
          return reply.code(400).send({
            error: "Folder cannot be moved into itself or its descendants.",
          });
        }

        visited.add(currentParentId);

        const ancestor = await mediaFolderRepository.getById(currentParentId);

        if (!ancestor || ancestor.ownerId !== userId) {
          return reply.code(400).send({
            error: "Invalid folder hierarchy.",
          });
        }

        currentParentId = ancestor.parentId;
      }
    }

    const updatedFolder = await mediaFolderRepository.update(id, result.data);

    return updatedFolder;
  });

  // Delete a media folder
  app.delete("/:id", async (request, reply) => {
    const userId = await requireAuth(request);
    const { id } = request.params as { id: string };

    const folder = await mediaFolderRepository.getById(id);

    if (!folder || folder.ownerId !== userId) {
      return reply.code(404).send({
        error: "Media folder not found.",
      });
    }

    const allFolders = await mediaFolderRepository.getAll();

    const hasChildren = allFolders.some(
      (item) => item.ownerId === userId && item.parentId === id,
    );

    if (hasChildren) {
      return reply.code(400).send({
        error: "Folder must have no subfolders before it can be deleted.",
      });
    }

    // Remove folder-media relations without deleting the media items.
    const relations = await folderMediaRepository.getMediaInFolder(id);

    for (const relation of relations) {
      await folderMediaRepository.remove(relation.folderId, relation.mediaId);
    }

    await mediaFolderRepository.delete(id);

    return {
      success: true,
    };
  });

  // Get media items in a folder
  app.get("/:folderId/media", async (request, reply) => {
    const userId = await requireAuth(request);

    const { folderId } = request.params as {
      folderId: string;
    };

    const folder = await mediaFolderRepository.getById(folderId);

    if (!folder || folder.ownerId !== userId) {
      return reply.code(404).send({
        error: "Media folder not found.",
      });
    }

    const relations = await folderMediaRepository.getMediaInFolder(folderId);

    const media = await Promise.all(
      relations.map((relation) => mediaRepository.getById(relation.mediaId)),
    );

    return media.filter(
      (item): item is NonNullable<typeof item> =>
        item !== undefined && item.ownerId === userId,
    );
  });

  // Add a media item to a folder
  app.post("/:folderId/media/:mediaId", async (request, reply) => {
    const userId = await requireAuth(request);

    const { folderId, mediaId } = request.params as {
      folderId: string;
      mediaId: string;
    };

    const folder = await mediaFolderRepository.getById(folderId);

    if (!folder || folder.ownerId !== userId) {
      return reply.code(404).send({
        error: "Media folder not found.",
      });
    }

    const media = await mediaRepository.getById(mediaId);

    if (!media || media.ownerId !== userId) {
      return reply.code(404).send({
        error: "Media not found.",
      });
    }

    try {
      const relation = await folderMediaRepository.add(folderId, mediaId);

      return reply.code(201).send(relation);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Media is already in this folder."
      ) {
        return reply.code(409).send({
          error: error.message,
        });
      }

      throw error;
    }
  });

  // Remove a media item from a folder
  app.delete("/:folderId/media/:mediaId", async (request, reply) => {
    const userId = await requireAuth(request);

    const { folderId, mediaId } = request.params as {
      folderId: string;
      mediaId: string;
    };

    const folder = await mediaFolderRepository.getById(folderId);

    if (!folder || folder.ownerId !== userId) {
      return reply.code(404).send({
        error: "Media folder not found.",
      });
    }

    const media = await mediaRepository.getById(mediaId);

    if (!media || media.ownerId !== userId) {
      return reply.code(404).send({
        error: "Media not found.",
      });
    }

    const removed = await folderMediaRepository.remove(folderId, mediaId);

    if (!removed) {
      return reply.code(404).send({
        error: "Media is not in this folder.",
      });
    }

    return {
      success: true,
    };
  });
};
