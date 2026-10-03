import { usersRepository } from "../storage/stores.js";
import { verifyPassword } from "./password.js";
import { createSession } from "./session-service.js";
import type { LoginInput } from "./auth-types.js";

export const login = async (input: LoginInput) => {
  const users = await usersRepository.getAll();

  const user = users.find((item) => item.username === input.username);

  if (!user) {
    return undefined;
  }

  const passwordValid = await verifyPassword(input.password, user.passwordHash);

  if (!passwordValid) {
    return undefined;
  }

  const session = await createSession(user.id);

  return {
    user,
    session,
  };
};
