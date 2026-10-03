import type { FastifyRequest } from "fastify";

import { getAuthenticatedUserId } from "./auth-context.js";

export const requireAuth = async (request: FastifyRequest): Promise<string> => {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    const error = new Error("Not authenticated.");

    (error as Error & { statusCode?: number }).statusCode = 401;

    throw error;
  }

  return userId;
};
