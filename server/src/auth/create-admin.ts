import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { usersRepository } from "../storage/stores.js";
import { hashPassword } from "./password.js";

const readline = createInterface({
  input,
  output,
});

try {
  const username = (await readline.question("Admin username: ")).trim();

  const password = await readline.question("Admin password: ");

  if (!username) {
    throw new Error("Username cannot be empty.");
  }

  if (!password) {
    throw new Error("Password cannot be empty.");
  }

  const existingUsers = await usersRepository.getAll();

  const usernameExists = existingUsers.some(
    (user) => user.username === username,
  );

  if (usernameExists) {
    throw new Error("Username already exists.");
  }

  const passwordHash = await hashPassword(password);

  const user = await usersRepository.create({
    username,
    passwordHash,
    role: "admin",
  });

  console.log(`Admin user created: ${user.username}`);
} finally {
  readline.close();
}
