import type { FastifyInstance } from "fastify";

import { requireAuth } from "../auth/require-auth.js";
import { mediaRepository } from "../media/media-repository.js";
import {
  createMediaSchema,
  updateMediaSchema,
} from "../media/media-schemas.js";

export const mediaRoutes = async (app: FastifyInstance): Promise<void> => {
  // Get all media belonging to the current user
  app.get("/", async (request) => {
    const userId = await requireAuth(request);

    const media = await mediaRepository.getAll();

    return media.filter((item) => item.ownerId === userId);
  });

  // Create a new media item
  app.post("/", async (request, reply) => {
    const userId = await requireAuth(request);

    const result = createMediaSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        error: "Invalid media data.",
        details: result.error.issues,
      });
    }

    const media = await mediaRepository.create({
      ownerId: userId,
      ...result.data,
      createdAt: new Date().toISOString(),
    });

    return reply.code(201).send(media);
  });

  // Get a single media item
  app.get("/:id", async (request, reply) => {
    const userId = await requireAuth(request);

    const { id } = request.params as { id: string };

    const media = await mediaRepository.getById(id);

    if (!media || media.ownerId !== userId) {
      return reply.code(404).send({
        error: "Media not found.",
      });
    }

    return media;
  });

  // Update an existing media item
  app.patch("/:id", async (request, reply) => {
    const userId = await requireAuth(request);

    const { id } = request.params as { id: string };

    const result = updateMediaSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        error: "Invalid media data.",
        details: result.error.issues,
      });
    }

    const media = await mediaRepository.getById(id);

    if (!media || media.ownerId !== userId) {
      return reply.code(404).send({
        error: "Media not found.",
      });
    }

    const updatedMedia = await mediaRepository.update(id, result.data);

    return updatedMedia;
  });

  // Delete a media item
  app.delete("/:id", async (request, reply) => {
    const userId = await requireAuth(request);

    const { id } = request.params as { id: string };

    const media = await mediaRepository.getById(id);

    if (!media || media.ownerId !== userId) {
      return reply.code(404).send({
        error: "Media not found.",
      });
    }

    await mediaRepository.delete(id);

    return {
      success: true,
    };
  });
};
