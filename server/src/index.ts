import Fastify from "fastify";
import cookie from "@fastify/cookie";
import { authRoutes } from "./routes/auth.js";
import { requireAuth } from "./auth/require-auth.js";
import { gameRoutes } from "./routes/games.js";

const app = Fastify({
  logger: true,
});

await app.register(cookie);

await app.register(authRoutes, {
  prefix: "/api/auth",
});

await app.register(gameRoutes, {
  prefix: "/api/games",
});

app.get("/api/health", async () => {
  return {
    status: "ok",
  };
});

app.get("/api/protected-test", async (request) => {
  const userId = await requireAuth(request);

  return {
    authenticated: true,
    userId,
  };
});

const start = async () => {
  try {
    await app.listen({
      port: 3000,
      host: "127.0.0.1",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
