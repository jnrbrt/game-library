import type { Session } from "../types/models.js";
import { sessionsStore } from "../storage/stores.js";
import { generateId } from "../utils/id.js";

export class SessionRepository {
  async create(userId: string, expiresAt: string): Promise<Session> {
    const sessions = await sessionsStore.read();

    const session: Session = {
      id: generateId(),
      userId,
      expiresAt,
    };

    sessions.push(session);

    await sessionsStore.write(sessions);

    return session;
  }

  async getById(id: string): Promise<Session | undefined> {
    const sessions = await sessionsStore.read();

    const session = sessions.find((item) => item.id === id);

    if (!session) {
      return undefined;
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      await this.delete(id);
      return undefined;
    }

    return session;
  }

  async delete(id: string): Promise<boolean> {
    const sessions = await sessionsStore.read();

    const filteredSessions = sessions.filter((session) => session.id !== id);

    if (filteredSessions.length === sessions.length) {
      return false;
    }

    await sessionsStore.write(filteredSessions);

    return true;
  }
}

export const sessionRepository = new SessionRepository();
