import { SESSION_DURATION_MS } from "./config.js";
import { sessionRepository } from "./session-repository.js";

export const createSession = async (userId: string) => {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  return sessionRepository.create(userId, expiresAt);
};

export const getSessionUserId = async (
  sessionId: string,
): Promise<string | undefined> => {
  console.log("SESSION DEBUG:", sessionId);

  const session = await sessionRepository.getById(sessionId);

  console.log("SESSION FOUND:", session);

  return session?.userId;
};

export const deleteSession = async (sessionId: string): Promise<boolean> => {
  return sessionRepository.delete(sessionId);
};
