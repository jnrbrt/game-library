import type { FastifyRequest } from "fastify";

import { getSessionUserId } from "./session-service.js";

const SESSION_COOKIE_NAME = "session";

export const getAuthenticatedUserId = async (
  request: FastifyRequest,
): Promise<string | undefined> => {
  const sessionId = request.cookies[SESSION_COOKIE_NAME];

  if (!sessionId) {
    return undefined;
  }

  return getSessionUserId(sessionId);
};
