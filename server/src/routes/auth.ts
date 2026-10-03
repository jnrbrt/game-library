import type { FastifyInstance } from "fastify";

import { login } from "../auth/auth-service.js";
import { getSessionUserId, deleteSession } from "../auth/session-service.js";
import { usersRepository } from "../storage/stores.js";
import type { LoginInput } from "../auth/auth-types.js";

const SESSION_COOKIE_NAME = "session";

export const authRoutes = async (app: FastifyInstance): Promise<void> => {
  app.post<{ Body: LoginInput }>("/login", async (request, reply) => {
    const result = await login(request.body);

    if (!result) {
      return reply.code(401).send({
        error: "Invalid username or password.",
      });
    }

    reply.setCookie(SESSION_COOKIE_NAME, result.session.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      expires: new Date(result.session.expiresAt),
    });

    return {
      user: {
        id: result.user.id,
        username: result.user.username,
        role: result.user.role,
      },
    };
  });

  app.get("/me", async (request, reply) => {
    const sessionId = request.cookies[SESSION_COOKIE_NAME];

    if (!sessionId) {
      return reply.code(401).send({
        error: "Not authenticated.",
      });
    }

    const userId = await getSessionUserId(sessionId);

    if (!userId) {
      return reply.code(401).send({
        error: "Not authenticated.",
      });
    }

    const user = await usersRepository.getById(userId);

    if (!user) {
      return reply.code(401).send({
        error: "Not authenticated.",
      });
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  });

  app.post("/logout", async (request, reply) => {
    const sessionId = request.cookies[SESSION_COOKIE_NAME];

    if (sessionId) {
      await deleteSession(sessionId);
    }

    reply.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    return {
      success: true,
    };
  });
};
